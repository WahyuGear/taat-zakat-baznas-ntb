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

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/rp\.?/gi, " ")
    .replace(/[^\p{L}\p{N}\s.,%?'/-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isGreeting(question: string): boolean {
  const q = normalize(question);

  return /^(assalamualaikum|assalamu'alaikum|halo|hai|hi|permisi|pagi|siang|sore|malam)(\s|$)/i.test(
    q
  );
}

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

/**
 * Mengubah tulisan seperti:
 *
 * 8 juta
 * 8 jt
 * 8jt
 * 8.000.000
 * 8000000
 * 8,5 juta
 *
 * menjadi angka rupiah.
 */
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

function asksAboutNisab(question: string): boolean {
  const q = normalize(question);

  return (
    q.includes("nisab") ||
    q.includes("nishab") ||
    q.includes("batas wajib zakat") ||
    q.includes("batas minimal zakat")
  );
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

/**
 * Jawaban cepat untuk pertanyaan nisab penghasilan.
 *
 * Tidak perlu memanggil Gemini.
 */
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

/**
 * Jawaban cepat untuk perhitungan gaji.
 *
 * Contoh:
 * gaji 8 juta kena zakat gak
 * gaji 8jt
 * zakat gaji 10 juta
 * penghasilan 15 juta berapa zakat
 */
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

  if (
    !asksForCalculation(question) &&
    !question.includes("zakat") &&
    !question.includes("gaji") &&
    !question.includes("penghasilan")
  ) {
    return null;
  }

  if (amount < NISAB_PENGHASILAN_2026) {
    return (
      `Kalau penghasilan Kakak ${formatRupiah(amount)} per bulan, ` +
      `jumlah tersebut masih di bawah nisab zakat penghasilan 2026 ` +
      `sebesar ${formatRupiah(NISAB_PENGHASILAN_2026)} per bulan.\n\n` +
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

/**
 * Pencarian FAQ lokal.
 *
 * Kita tidak lagi mengirim 60 FAQ sekaligus ke Gemini.
 */
function findBestFAQ(question: string) {
  const q = normalize(question);

  let best:
    | {
        faq: (typeof ZAVIRA_FAQ)[number];
        score: number;
      }
    | null = null;

  for (const faq of ZAVIRA_FAQ) {
    let score = 0;

    const questionText = normalize(faq.question);

    if (q === questionText) {
      score += 100;
    }

    if (q.includes(questionText)) {
      score += 50;
    }

    for (const keyword of faq.keywords) {
      const keywordNormalized = normalize(keyword);

      if (q.includes(keywordNormalized)) {
        score += Math.max(5, keywordNormalized.length);
      }
    }

    const words = q
      .split(" ")
      .filter((word) => word.length >= 3);

    for (const word of words) {
      if (questionText.includes(word)) {
        score += 2;
      }
    }

    if (!best || score > best.score) {
      best = {
        faq,
        score,
      };
    }
  }

  if (!best || best.score < 7) {
    return null;
  }

  return best.faq;
}

/**
 * Mengambil FAQ yang paling relevan untuk diberikan kepada Gemini.
 *
 * Maksimal beberapa item saja.
 */
function getRelevantKnowledge(question: string) {
  const q = normalize(question);

  const scored = ZAVIRA_FAQ.map((faq) => {
    let score = 0;

    const text = normalize(
      `${faq.question} ${faq.answer} ${faq.keywords.join(" ")}`
    );

    const words = q
      .split(" ")
      .filter((word) => word.length >= 3);

    for (const word of words) {
      if (text.includes(word)) {
        score += 1;
      }
    }

    for (const keyword of faq.keywords) {
      const keywordNormalized = normalize(keyword);

      if (q.includes(keywordNormalized)) {
        score += 5;
      }
    }

    return {
      faq,
      score,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .filter((item) => item.score > 0)
    .map((item) => item.faq);
}

function cleanAnswer(answer: string): string {
  return answer
    .replace(/^Jawaban:\s*/i, "")
    .replace(/^ZAVIRA:\s*/i, "")
    .replace(/^ZAVIRA AI:\s*/i, "")
    .replace(/\*\*/g, "")
    .trim();
}

function getGeminiModel(): string {
  /**
   * Kalau .env masih:
   *
   * GEMINI_MODEL=gemini-2.5-flash
   *
   * otomatis diarahkan ke model baru.
   */
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

async function generateGeminiAnswer(
  question: string,
  history: Array<{
    role: "user" | "assistant";
    content: string;
  }> = []
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error(
      "ZAVIRA ERROR: GEMINI_API_KEY tidak ditemukan"
    );

    return null;
  }

  const model = getGeminiModel();

  const relevantKnowledge = getRelevantKnowledge(question);

  const knowledgeText =
    relevantKnowledge.length > 0
      ? relevantKnowledge
          .map(
            (faq) =>
              `Q: ${faq.question}\nA: ${faq.answer}`
          )
          .join("\n\n")
      : "Tidak ada materi FAQ yang sangat relevan.";

  /**
   * Hanya kirim beberapa chat terakhir.
   * Jangan kirim seluruh percakapan.
   */
  const recentHistory = history
    .slice(-6)
    .map(
      (item) =>
        `${item.role === "user" ? "Pengguna" : "ZAVIRA"}: ${
          item.content
        }`
    )
    .join("\n");

  const prompt = `
Kamu adalah ZAVIRA AI — Zakat Virtual Assistant.

Kamu membantu pengguna tentang:
- zakat
- infak
- sedekah
- zakat penghasilan
- zakat mal
- zakat pertanian
- zakat peternakan
- zakat perdagangan

GAYA:
- Bahasa Indonesia.
- Ramah.
- Natural seperti petugas customer service.
- Singkat.
- Langsung ke inti.
- Jangan bertele-tele.
- Jangan mengulang pertanyaan.
- Jangan menggunakan pembukaan panjang.
- Jangan menyebut database, knowledge base, prompt, context, atau AI model.
- Emoji secukupnya.

PENTING:
- Jangan mengarang angka.
- Jangan mengarang nisab.
- Jangan mengarang persentase.
- Jangan mengarang rekening.
- Jangan mengarang nomor WhatsApp.
- Jangan membuat kebijakan BAZNAS NTB.
- Gunakan materi yang diberikan.
- Jika informasi tidak tersedia, gunakan fallback.

FALLBACK:
"${FALLBACK}"

DATA RELEVAN:
${knowledgeText}

RIWAYAT SINGKAT:
${recentHistory || "Tidak ada riwayat."}

PERTANYAAN TERBARU:
${question}

JAWAB MAKSIMAL 3 PARAGRAF PENDEK.
Jika pertanyaan dapat dijawab dengan angka yang tersedia di materi, langsung berikan angkanya.
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
          temperature: 0.15,
          maxOutputTokens: 350,
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

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const question =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    const history = Array.isArray(body?.history)
      ? body.history
          .filter(
            (item: any) =>
              (item?.role === "user" ||
                item?.role === "assistant") &&
              typeof item?.content === "string"
          )
          .slice(-8)
      : [];

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

    /**
     * 1. GREETING
     */
    if (isGreeting(question)) {
      return NextResponse.json({
        success: true,
        reply: GREETING,
      });
    }

    /**
     * 2. CASUAL
     */
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

    /**
     * 3. NISAB PENGHASILAN
     *
     * Ini langsung dijawab tanpa Gemini.
     */
    if (
      looksLikeIncomeQuestion(question) &&
      asksAboutNisab(question)
    ) {
      return NextResponse.json({
        success: true,
        reply: getIncomeNisabAnswer(),
      });
    }

    /**
     * 4. HITUNG GAJI / PENGHASILAN
     *
     * Ini juga langsung.
     *
     * Contoh:
     * "gaji 8 jt kena zakat gak"
     * "gaji 10 juta"
     * "penghasilan 15jt zakat berapa"
     */
    const calculatedIncome =
      calculateIncomeZakat(question);

    if (calculatedIncome) {
      return NextResponse.json({
        success: true,
        reply: calculatedIncome,
      });
    }

    /**
     * 5. FAQ LOCAL
     *
     * Kalau sudah ada jawaban yang cocok,
     * tidak perlu memanggil Gemini.
     */
    const faq = findBestFAQ(question);

    if (faq) {
      return NextResponse.json({
        success: true,
        reply: faq.answer,
      });
    }

    /**
     * 6. GEMINI
     *
     * Hanya pertanyaan yang benar-benar
     * membutuhkan pemahaman kontekstual.
     */
    const answer = await generateGeminiAnswer(
      question,
      history
    );

    if (!answer) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ZAVIRA sedang mengalami gangguan saat menghubungi layanan AI.",
        },
        { status: 500 }
      );
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