export default function Testimonials() {
    const testimonials = [
      {
        name: "Ahmad Rizki",
        text: "Alhamdulillah, proses donasinya sangat mudah dan laporan penyalurannya jelas.",
      },
      {
        name: "Nur Aisyah",
        text: "Saya rutin menunaikan zakat melalui BAZNAS NTB karena terpercaya dan transparan.",
      },
      {
        name: "Budi Santoso",
        text: "Program-programnya benar-benar membantu masyarakat yang membutuhkan.",
      },
    ];
  
    return (
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
  
          <h2 className="text-center text-4xl font-bold">
            Apa Kata Donatur
          </h2>
  
          <p className="mt-4 text-center text-gray-500">
            Kepercayaan para donatur menjadi semangat kami untuk terus menebar manfaat.
          </p>
  
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-4 text-4xl">💚</div>
  
                <p className="leading-8 text-gray-600">
                  "{item.text}"
                </p>
  
                <h3 className="mt-6 text-lg font-bold">
                  {item.name}
                </h3>
              </div>
            ))}
          </div>
  
        </div>
      </section>
    );
  }