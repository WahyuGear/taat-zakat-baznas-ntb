export default function FAQ() {
    const faqs = [
      {
        question: "Apakah donasi saya aman?",
        answer:
          "Ya. Seluruh donasi dikelola oleh BAZNAS Provinsi NTB secara aman, transparan, dan sesuai syariat.",
      },
      {
        question: "Apakah saya akan mendapatkan laporan?",
        answer:
          "Ya. Setiap program memiliki laporan penyaluran yang dapat diakses oleh donatur.",
      },
      {
        question: "Metode pembayaran apa saja yang tersedia?",
        answer:
          "Transfer Bank, QRIS, Virtual Account, dan Payment Gateway.",
      },
      {
        question: "Apakah donasi bisa atas nama orang lain?",
        answer:
          "Bisa. Saat proses donasi Anda dapat mengisi nama sesuai keinginan.",
      },
    ];
  
    return (
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-4xl px-6">
  
          <h2 className="text-center text-4xl font-bold">
            Pertanyaan yang Sering Ditanyakan
          </h2>
  
          <div className="mt-12 space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
  
                <p className="mt-3 text-gray-600 leading-7">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
  
        </div>
      </section>
    );
  }