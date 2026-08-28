import Link from "next/link";

const categories = [
  {
    icon: "🕌",
    title: "Zakat",
    href: "/campaign?category=Zakat",
    color: "bg-emerald-100",
  },
  {
    icon: "❤️",
    title: "Sedekah",
    href: "/campaign?category=Sedekah",
    color: "bg-red-100",
  },
  {
    icon: "🤲",
    title: "Infak",
    href: "/campaign?category=Infak",
    color: "bg-yellow-100",
  },
  {
    icon: "🚑",
    title: "Kemanusiaan",
    href: "/campaign?category=Kemanusiaan",
    color: "bg-sky-100",
  },
  {
    icon: "🎓",
    title: "Pendidikan",
    href: "/campaign?category=Pendidikan",
    color: "bg-violet-100",
  },
  {
    icon: "🌱",
    title: "Pemberdayaan",
    href: "/campaign?category=Pemberdayaan",
    color: "bg-lime-100",
  },
  {
    icon: "👴",
    title: "Lansia",
    href: "/campaign?category=Lansia",
    color: "bg-orange-100",
  },
  {
    icon: "🐄",
    title: "Kurban",
    href: "/campaign?category=Kurban",
    color: "bg-green-200",
  },
];

export default function Categories() {
  return (
    <section className="bg-white py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4">

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold md:text-4xl">
            Kategori Donasi
          </h2>

          <p className="mt-2 text-sm text-gray-500 md:text-base">
            Pilih program sesuai kebutuhan Anda.
          </p>
        </div>

        {/* Mobile Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-3 lg:hidden">
          {categories.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex min-w-[90px] flex-col items-center"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${item.color} text-3xl shadow-sm`}
              >
                {item.icon}
              </div>

              <span className="mt-2 text-center text-xs font-semibold">
                {item.title}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden grid-cols-4 gap-6 md:grid lg:grid-cols-8">
          {categories.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border bg-white p-5 text-center transition hover:-translate-y-1 hover:border-green-600 hover:shadow-lg"
            >
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${item.color} text-3xl transition group-hover:scale-110`}
              >
                {item.icon}
              </div>

              <h3 className="mt-4 text-sm font-bold">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}