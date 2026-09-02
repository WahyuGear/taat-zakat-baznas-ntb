import { NextRequest, NextResponse } from "next/server";
import { ZAVIRA_FAQ } from "@/knowledge/zavira-faq";

export const runtime = "nodejs";

const FALLBACK =
  "Maaf, informasi tersebut belum tersedia dalam pengetahuan ZAVIRA. Untuk memastikan jawaban yang tepat, silakan berkonsultasi dengan petugas BAZNAS NTB.";

const GREETING =
  "Wa'alaikumussalam 👋 Saya ZAVIRA AI. Ada yang ingin ditanyakan tentang zakat, infak, atau sedekah? Silakan, saya bantu.";

const NISAB_PENGHASILAN_2026 = 7_640_144;
const NISAB_PENGHASILAN_TAHUNAN_2026 = 91_681_728;
const KADAR_PENGHASILAN = 0.025;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/* =========================================================
   NORMALIZE
========================================================= */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/rp\.?/gi, " ")
    .replace(/[^\p{L}\p{N}\s.,%?'/-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   GREETING
========================================================= */

function isGreeting(question: string): boolean {
  const q = normalize(question);

  return /^(assalamualaikum|assalamu'alaikum|halo|hai|hi|permisi|pagi|siang|sore|malam)(\s|$)/i.test(
    q
  );
}

/* =========================================================
   CASUAL
========================================================= */

function isCasualConversation(question: string): boolean {
  const q = normalize(question);

  return [
    "terima kasih",
    "makasih",
    "thanks",
    "oke",
    "ok",
    "baik",
    "siap",
    "mantap",
    "iya",
    "ya",
  ].includes(q);
}

/* =========================================================
   INTENT
========================================================= */

function isComparisonQuestion(question: string): boolean {
  const q = normalize(question);

  const comparisonWords = [
    "perbedaan",
    "perbedaan antara",
    "beda",
    "bedanya",
    "apa bedanya",
    "apa perbedaannya",
    "dibandingkan",
    "bandingkan",
    "perbandingan",
    "mana yang berbeda",
    "sama atau beda",
  ];

  return comparisonWords.some((word) => q.includes(word));
}

function isSimilarityQuestion(question: string): boolean {
  const q = normalize(question);

  return [
    "persamaan",
    "apa persamaan",
    "sama-sama",
    "sama sama",
    "kesamaan",
    "apa yang sama",
  ].some((word) => q.includes(word));
}

function isExampleQuestion(question: string): boolean {
  const q = normalize(question);

  return [
    "contoh",
    "contohnya",
    "misalnya",
    "contoh kasus",
    "beri contoh",
    "kasih contoh",
  ].some((word) => q.includes(word));
}

function isLawQuestion(question: string): boolean {
  const q = normalize(question);

  return [
    "hukumnya",
    "apa hukumnya",
    "hukum",
    "wajib atau sunnah",
    "wajib atau sunah",
    "apakah wajib",
    "apakah sunnah",
    "apakah sunah",
    "boleh tidak",
    "boleh gak",
    "bolehkah",
  ].some((word) => q.includes(word));
}

function isHowQuestion(question: string): boolean {
  const q = normalize(question);

  return [
    "bagaimana cara",
    "cara",
    "bagaimana",
    "gimana cara",
    "prosedur",
    "langkah",
    "cara membayar",
    "cara menyalurkan",
  ].some((word) => q.includes(word));
}

function isWhyQuestion(question: string): boolean {
  const q = normalize(question);

  return [
    "kenapa",
    "mengapa",
    "mengapa harus",
    "kenapa harus",
    "alasan",
    "apa alasannya",
  ].some((word) => q.includes(word));
}

function asksForCalculation(question: string): boolean {
  const q = normalize(question);

  return [
    "hitung",
    "hitungkan",
    "perhitungkan",
    "berapa zakat",
    "zakat berapa",
    "kena zakat",
    "wajib zakat",
    "bayar zakat berapa",
    "harus bayar zakat",
  ].some((phrase) => q.includes(phrase));
}

function asksAboutNisab(question: string): boolean {
  const q = normalize(question);

  return (
    q.includes("nisab") ||
    q.includes("nishab") ||
    q.includes("batas wajib zakat") ||
    q.includes("batas minimal zakat")
  );
}

/* =========================================================
   INCOME DETECTION
========================================================= */

function looksLikeIncomeQuestion(question: string): boolean {
  const q = normalize(question);

  const keywords = [
    "gaji",
    "penghasilan",
    "pendapatan",
    "honor",
    "honorarium",
    "upah",
    "profesi",
    "profesional",
    "salary",
    "income",
    "zakat penghasilan",
    "zakat gaji",
  ];

  return keywords.some((word) => q.includes(word));
}

/* =========================================================
   RUPIAH
========================================================= */

function parseRupiah(text: string): number | null {
  const q = normalize(text);

  const millionMatch = q.match(
    /(\d+(?:[.,]\d+)?)\s*(juta|jt)\b/i
  );

  if (millionMatch) {
    const raw = millionMatch[1].replace(",", ".");
    const value = Number(raw);

    if (Number.isFinite(value)) {
      return Math.round(value * 1_000_000);
    }
  }

  const thousandMatch = q.match(
    /(\d+(?:[.,]\d+)?)\s*(ribu|rb)\b/i
  );

  if (thousandMatch) {
    const raw = thousandMatch[1].replace(",", ".");
    const value = Number(raw);

    if (Number.isFinite(value)) {
      return Math.round(value * 1_000);
    }
  }

  const numericMatch = q.match(
    /(?:rp\s*)?(\d{1,3}(?:[.,]\d{3})+|\d{4,})/
  );

  if (numericMatch) {
    let raw = numericMatch[1];

    if (
      raw.includes(".") &&
      raw.split(".").every((part) => /^\d{3}$/.test(part))
    ) {
      raw = raw.replace(/\./g, "");
    } else if (
      raw.includes(",") &&
      raw.split(",").every((part) => /^\d{3}$/.test(part))
    ) {
      raw = raw.replace(/,/g, "");
    } else {
      raw = raw.replace(",", ".");
    }

    const value = Number(raw);

    if (Number.isFinite(value) && value > 0) {
      return Math.round(value);
    }
  }

  return null;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/* =========================================================
   JAWABAN CEPAT PENGHASILAN
========================================================= */

function getIncomeNisabAnswer(): string {
  return (
    `Untuk tahun 2026, nisab zakat penghasilan dan jasa adalah ` +
    `${formatRupiah(NISAB_PENGHASILAN_2026)} per bulan ` +
    `atau ${formatRupiah(NISAB_PENGHASILAN_TAHUNAN_2026)} per tahun. ` +
    `Nisab tersebut setara dengan 85 gram emas.\n\n` +
    `Jika penghasilan sudah mencapai atau melebihi nisab, ` +
    `kadar zakat penghasilan adalah 2,5%. 😊`
  );
}

function calculateIncomeZakat(
  question: string
): string | null {
  if (!looksLikeIncomeQuestion(question)) {
    return null;
  }

  const amount = parseRupiah(question);

  if (!amount) {
    return null;
  }

  const normalizedQuestion = normalize(question);

  if (
    !asksForCalculation(question) &&
    !normalizedQuestion.includes("zakat") &&
    !normalizedQuestion.includes("gaji") &&
    !normalizedQuestion.includes("penghasilan")
  ) {
    return null;
  }

  if (amount < NISAB_PENGHASILAN_2026) {
    return (
      `Kalau penghasilan Kakak ${formatRupiah(amount)} per bulan, ` +
      `jumlah tersebut masih di bawah nisab zakat penghasilan 2026 ` +
      `sebesar ${formatRupiah(
        NISAB_PENGHASILAN_2026
      )} per bulan.\n\n` +
      `Jadi, berdasarkan nisab bulanan tersebut, belum wajib zakat penghasilan. ` +
      `Namun tetap boleh berinfak atau bersedekah sesuai kemampuan. 😊`
    );
  }

  const zakat = Math.floor(amount * KADAR_PENGHASILAN);

  return (
    `Iya Kak, penghasilan ${formatRupiah(amount)} per bulan ` +
    `sudah mencapai nisab zakat penghasilan 2026 sebesar ` +
    `${formatRupiah(NISAB_PENGHASILAN_2026)}.\n\n` +
    `Kadar zakat penghasilan adalah 2,5%.\n\n` +
    `${formatRupiah(amount)} × 2,5% = ${formatRupiah(zakat)}\n\n` +
    `Jadi zakat penghasilannya sekitar **${formatRupiah(
      zakat
    )} per bulan**. 😊`
  );
}

/* =========================================================
   FAQ SEARCH
========================================================= */

function getRelevantKnowledge(
  question: string,
  limit = 8
) {
  const q = normalize(question);

  /*
   * Kata penting yang harus dipertahankan ketika
   * pengguna menanyakan beberapa objek sekaligus.
   */
  const topicTerms = [
    "zakat",
    "infak",
    "infaq",
    "sedekah",
    "zakat penghasilan",
    "zakat mal",
    "zakat pertanian",
    "zakat peternakan",
    "zakat perdagangan",
    "zakat fitrah",
    "nisab",
    "kadar",
    "muzaki",
    "muzakki",
    "munfik",
    "mustahik",
  ];

  const requestedTopics = topicTerms.filter((term) =>
    q.includes(term)
  );

  const scored = ZAVIRA_FAQ.map((faq) => {
    let score = 0;

    const questionText = normalize(faq.question);
    const answerText = normalize(faq.answer);

    const keywordText = faq.keywords
      .map((keyword) => normalize(keyword))
      .join(" ");

    /* Exact question */
    if (q === questionText) {
      score += 100;
    }

    /* Pertanyaan mengandung judul FAQ */
    if (
      questionText.length >= 5 &&
      q.includes(questionText)
    ) {
      score += 60;
    }

    /* FAQ mengandung pertanyaan pengguna */
    if (
      q.length >= 5 &&
      questionText.includes(q)
    ) {
      score += 30;
    }

    /* Keyword FAQ */
    for (const keyword of faq.keywords) {
      const normalizedKeyword = normalize(keyword);

      if (
        normalizedKeyword.length >= 3 &&
        q.includes(normalizedKeyword)
      ) {
        score += 15;
      }
    }

    /* Token pertanyaan */
    const words = q
      .split(" ")
      .filter((word) => word.length >= 3);

    for (const word of words) {
      if (questionText.includes(word)) {
        score += 4;
      }

      if (keywordText.includes(word)) {
        score += 2;
      }

      if (answerText.includes(word)) {
        score += 1;
      }
    }

    /*
     * BOOST MULTI-TOPIK
     *
     * Contoh:
     * "apa beda infak dan sedekah"
     *
     * FAQ tentang infak harus masuk.
     * FAQ tentang sedekah juga harus masuk.
     */
    if (requestedTopics.length >= 2) {
      for (const topic of requestedTopics) {
        if (
          questionText.includes(topic) ||
          keywordText.includes(topic) ||
          answerText.includes(topic)
        ) {
          score += 25;
        }
      }
    }

    /* Boost khusus pertanyaan perbandingan */
    if (isComparisonQuestion(question)) {
      const comparisonTerms = [
        "zakat",
        "infak",
        "infaq",
        "sedekah",
        "penghasilan",
        "mal",
        "pertanian",
        "peternakan",
        "perdagangan",
        "fitrah",
        "muzaki",
        "muzakki",
        "munfik",
        "mustahik",
      ];

      for (const term of comparisonTerms) {
        if (
          q.includes(term) &&
          (
            questionText.includes(term) ||
            keywordText.includes(term) ||
            answerText.includes(term)
          )
        ) {
          score += 12;
        }
      }
    }

    return {
      faq,
      score,
    };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.faq);
}

/* =========================================================
   GEMINI MODEL
========================================================= */

function getGeminiModel(): string {
  const envModel = process.env.GEMINI_MODEL?.trim();

  if (
    !envModel ||
    envModel === "gemini-2.5-flash" ||
    envModel === "gemini-2.5-flash-latest"
  ) {
    return "gemini-3.6-flash";
  }

  return envModel;
}

/* =========================================================
   GEMINI
========================================================= */

async function generateGeminiAnswer(
  question: string,
  history: ChatMessage[] = []
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error(
      "ZAVIRA ERROR: GEMINI_API_KEY tidak ditemukan"
    );

    return null;
  }

  const model = getGeminiModel();

  /*
   * Pertanyaan perbandingan membutuhkan lebih banyak
   * materi karena biasanya menyentuh minimal 2 topik.
   */
  const knowledgeLimit = isComparisonQuestion(question)
    ? 12
    : isSimilarityQuestion(question)
      ? 12
      : 8;

  const relevantKnowledge = getRelevantKnowledge(
    question,
    knowledgeLimit
  );

  const knowledgeText =
    relevantKnowledge.length > 0
      ? relevantKnowledge
          .map(
            (faq, index) =>
              `[MATERI ${index + 1}]
Pertanyaan: ${faq.question}
Jawaban: ${faq.answer}
Kata kunci: ${faq.keywords.join(", ")}`
          )
          .join("\n\n")
      : "Tidak ditemukan materi FAQ yang relevan.";

  const recentHistory = history
    .slice(-8)
    .map(
      (item) =>
        `${item.role === "user" ? "Pengguna" : "ZAVIRA"}: ${
          item.content
        }`
    )
    .join("\n");

  /* =======================================================
     INTENT INSTRUCTIONS
  ======================================================= */

  const intentInstructions = `
INTENT PERTANYAAN:

${
  isComparisonQuestion(question)
    ? `PERTANYAAN PERBANDINGAN.

Ini adalah pertanyaan perbandingan.

WAJIB:
1. Identifikasi SEMUA objek yang dibandingkan.
2. Jelaskan objek pertama.
3. Jelaskan objek kedua.
4. Jelaskan PERBEDAAN UTAMA.
5. Jika materi mendukung, tambahkan persamaan.
6. Jika pengguna meminta atau memang membantu, berikan contoh.

JANGAN:
- hanya menjelaskan salah satu objek;
- mengabaikan objek kedua;
- mengambil satu FAQ lalu berhenti.

Gunakan struktur yang jelas dan ringkas.`
    : ""
}

${
  isSimilarityQuestion(question)
    ? `PERTANYAAN PERSAMAAN.

Fokus pada kesamaan kedua atau beberapa hal yang ditanyakan.

Bahas semua objek yang dibandingkan.
Jangan berubah menjadi penjelasan satu istilah saja.`
    : ""
}

${
  isExampleQuestion(question)
    ? `PERTANYAAN CONTOH.

Berikan contoh konkret berdasarkan materi yang tersedia.
Jangan membuat contoh yang bertentangan dengan materi.`
    : ""
}

${
  isLawQuestion(question)
    ? `PERTANYAAN HUKUM.

Jelaskan status hukumnya berdasarkan materi yang tersedia.
Jangan membuat hukum atau ketentuan baru.`
    : ""
}

${
  isHowQuestion(question)
    ? `PERTANYAAN CARA.

Berikan langkah atau cara yang memang didukung oleh materi.`
    : ""
}

${
  isWhyQuestion(question)
    ? `PERTANYAAN ALASAN.

Jelaskan alasan berdasarkan materi yang tersedia.`
    : ""
}
`;

  /* =======================================================
     PROMPT UTAMA
  ======================================================= */

  const prompt = `
Kamu adalah ZAVIRA AI — Zakat Virtual Assistant resmi BAZNAS NTB.

IDENTITAS:

- Nama: ZAVIRA AI
- Kepanjangan: Zakat Virtual Assistant
- Institusi: BAZNAS NTB

TUGAS UTAMA:

Membantu masyarakat memahami zakat, infak, sedekah, dan informasi terkait berdasarkan materi pengetahuan yang diberikan.

TOPIK YANG DILAYANI:

- Zakat
- Infak
- Sedekah
- Zakat penghasilan
- Zakat mal
- Zakat pertanian
- Zakat peternakan
- Zakat perdagangan
- Nisab
- Kadar zakat
- Muzaki
- Mustahik
- Penyaluran zakat
- Pertanyaan lanjutan yang masih berkaitan dengan topik tersebut

==================================================
ATURAN PALING PENTING
==================================================

1. Pahami MAKSUD pertanyaan, bukan hanya kata kuncinya.

2. Jika pengguna bertanya:
   "apa perbedaan A dan B"
   maka WAJIB membahas A DAN B.

3. Jangan pernah menjawab pertanyaan perbandingan hanya dengan definisi salah satu objek.

4. Jika pengguna menyebut dua topik, pastikan materi untuk kedua topik tersebut dipertimbangkan.

5. Jika pengguna bertanya:
   "apa persamaan A dan B"
   bahas A DAN B serta kesamaannya.

6. Jika pengguna bertanya "kenapa", jelaskan alasannya berdasarkan materi.

7. Jika pengguna meminta contoh, berikan contoh berdasarkan materi.

8. Jika pengguna melakukan pertanyaan lanjutan, gunakan RIWAYAT PERCAKAPAN untuk memahami konteks.

9. Gunakan beberapa materi FAQ sekaligus jika pertanyaan membutuhkan gabungan informasi.

10. FAQ adalah SUMBER PENGETAHUAN.
    Jangan sekadar menyalin satu FAQ.

11. Jangan mengarang fakta yang tidak ada dalam materi.

12. Jangan mengarang:
    - angka;
    - nisab;
    - persentase;
    - rekening;
    - nomor WhatsApp;
    - kebijakan;
    - aturan BAZNAS NTB;
    - ketentuan syariat yang tidak tersedia dalam materi.

13. Jika informasi tidak tersedia atau materi tidak cukup untuk memastikan jawaban, gunakan fallback.

14. Jangan mengatakan:
    - "berdasarkan database"
    - "berdasarkan knowledge base"
    - "berdasarkan prompt"
    - "menurut context"
    - "berdasarkan context"
    - "saya sebagai AI"

15. Jangan menyebut proses internal pencarian materi.

16. Jangan membuat seolah-olah ZAVIRA adalah petugas manusia.

17. Jika pertanyaan membutuhkan keputusan resmi atau kasus khusus, arahkan secara sopan kepada petugas BAZNAS NTB.

==================================================
ATURAN KHUSUS PERBANDINGAN
==================================================

Jika pengguna bertanya tentang perbedaan dua hal, misalnya:

"apa beda infak dan sedekah"

JAWABAN HARUS membahas:

- Infak
- Sedekah
- Perbedaan utama
- Persamaan jika relevan
- Contoh jika membantu

Jangan hanya menjawab:
"Infak adalah..."

Kemudian berhenti.

Untuk pertanyaan perbandingan, gunakan struktur seperti:

**Perbedaannya:**

- **Infak:** ...
- **Sedekah:** ...

**Intinya:**
...

Jika informasi mendukung, tambahkan:

**Contoh:**
...

==================================================
GAYA JAWABAN
==================================================

- Bahasa Indonesia.
- Ramah.
- Hangat.
- Natural.
- Profesional tetapi tidak kaku.
- Seperti asisten yang benar-benar memahami pertanyaan.
- Langsung ke inti.
- Paragraf pendek.
- Gunakan bullet point jika membantu.
- Emoji secukupnya.
- Jangan mengulang pertanyaan pengguna.
- Jangan terlalu panjang untuk pertanyaan sederhana.
- Jangan terlalu pendek untuk pertanyaan yang membutuhkan perbandingan atau penjelasan.

Untuk perbandingan, jawaban boleh lebih dari 3 paragraf jika memang diperlukan.

==================================================
KEAMANAN INFORMASI
==================================================

Gunakan hanya informasi yang didukung oleh materi.

Jika beberapa materi relevan, gabungkan dengan hati-hati.

Jika materi tidak cukup untuk menjawab pertanyaan, jangan menebak.

FALLBACK:

"${FALLBACK}"

==================================================
MATERI PENGETAHUAN
==================================================

${knowledgeText}

==================================================
RIWAYAT PERCAKAPAN
==================================================

${recentHistory || "Belum ada riwayat percakapan."}

==================================================
${intentInstructions}
==================================================

PERTANYAAN TERBARU:

${question}

==================================================
INSTRUKSI TERAKHIR
==================================================

Sebelum menjawab, pahami dulu apa yang sebenarnya diminta pengguna.

Jika pertanyaan meminta PERBANDINGAN:
- identifikasi semua objek;
- gunakan materi untuk semua objek;
- jawab sebagai perbandingan;
- jangan hanya menjelaskan satu objek.

Jika pertanyaan meminta PERSAMAAN:
- bahas semua objek;
- fokus pada kesamaan.

Jika pertanyaan meminta PENJELASAN:
- jelaskan secara natural.

Jika pertanyaan meminta CONTOH:
- berikan contoh.

Jika pertanyaan merupakan LANJUTAN:
- sambungkan dengan konteks percakapan sebelumnya.

Jawab secara ringkas tetapi LENGKAP.

Jangan memotong jawaban sebelum semua bagian penting dari pertanyaan terjawab.

Jangan mengarang informasi di luar materi.
`;

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

  console.log("=================================");
  console.log("ZAVIRA GEMINI REQUEST");
  console.log("MODEL:", model);
  console.log("QUESTION:", question);
  console.log(
    "INTENT COMPARISON:",
    isComparisonQuestion(question)
  );
  console.log(
    "INTENT SIMILARITY:",
    isSimilarityQuestion(question)
  );
  console.log(
    "RELEVANT FAQ:",
    relevantKnowledge.length
  );
  console.log("=================================");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200,
        },
      }),
    });

    const responseText = await response.text();

    console.log("=================================");
    console.log("ZAVIRA GEMINI RESPONSE");
    console.log("STATUS:", response.status);
    console.log("=================================");

    if (!response.ok) {
      console.error(
        "ZAVIRA GEMINI ERROR:",
        responseText
      );

      return null;
    }

    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "ZAVIRA ERROR: Response Gemini bukan JSON"
      );

      return null;
    }

    const parts =
      data?.candidates?.[0]?.content?.parts;

    if (!Array.isArray(parts)) {
      console.error(
        "ZAVIRA ERROR: Gemini tidak mengembalikan parts"
      );

      return null;
    }

    const answer = parts
      .map(
        (part: { text?: string }) =>
          part.text ?? ""
      )
      .join("")
      .trim();

    if (!answer) {
      return null;
    }

    return answer;
  } catch (error) {
    console.error(
      "ZAVIRA GEMINI FETCH ERROR:",
      error
    );

    return null;
  }
}

/* =========================================================
   CLEAN ANSWER
========================================================= */

function cleanAnswer(answer: string): string {
  return answer
    .replace(/^Jawaban:\s*/i, "")
    .replace(/^ZAVIRA:\s*/i, "")
    .replace(/^ZAVIRA AI:\s*/i, "")
    .trim();
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const question =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    const history: ChatMessage[] =
      Array.isArray(body?.history)
        ? body.history
            .filter(
              (item: any) =>
                (item?.role === "user" ||
                  item?.role === "assistant") &&
                typeof item?.content === "string"
            )
            .slice(-8)
        : [];

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Silakan tuliskan pertanyaan Anda tentang zakat, infak, atau sedekah.",
        },
        { status: 400 }
      );
    }

    if (question.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Silakan ringkas pertanyaannya sedikit agar ZAVIRA dapat membantu dengan lebih tepat.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       1. GREETING
    ===================================================== */

    if (isGreeting(question)) {
      return NextResponse.json({
        success: true,
        reply: GREETING,
      });
    }

    /* =====================================================
       2. CASUAL
    ===================================================== */

    if (isCasualConversation(question)) {
      const q = normalize(question);

      if (
        q === "terima kasih" ||
        q === "makasih" ||
        q === "thanks"
      ) {
        return NextResponse.json({
          success: true,
          reply:
            "Sama-sama 😊 Kalau masih ada yang ingin ditanyakan tentang zakat, infak, atau sedekah, silakan.",
        });
      }

      return NextResponse.json({
        success: true,
        reply:
          "Siap Kak 😊 Silakan, saya bantu.",
      });
    }

    /* =====================================================
       3. NISAB PENGHASILAN
    ===================================================== */

    if (
      looksLikeIncomeQuestion(question) &&
      asksAboutNisab(question)
    ) {
      return NextResponse.json({
        success: true,
        reply: getIncomeNisabAnswer(),
      });
    }

    /* =====================================================
       4. HITUNG PENGHASILAN
    ===================================================== */

    const calculatedIncome =
      calculateIncomeZakat(question);

    if (calculatedIncome) {
      return NextResponse.json({
        success: true,
        reply: calculatedIncome,
      });
    }

    /* =====================================================
       5. SEMUA PERTANYAAN KONSEPTUAL
    ===================================================== */

    const answer = await generateGeminiAnswer(
      question,
      history
    );

    /* =====================================================
       6. GEMINI GAGAL
    ===================================================== */

    if (!answer) {
      return NextResponse.json({
        success: true,
        reply: FALLBACK,
      });
    }

    const cleanedAnswer = cleanAnswer(answer);

    if (!cleanedAnswer) {
      return NextResponse.json({
        success: true,
        reply: FALLBACK,
      });
    }

    return NextResponse.json({
      success: true,
      reply: cleanedAnswer,
    });
  } catch (error) {
    console.error(
      "ZAVIRA ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan pada ZAVIRA.",
      },
      { status: 500 }
    );
  }
}