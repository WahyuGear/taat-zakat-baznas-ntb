import Link from "next/link";
import {
  Landmark,
  Heart,
  HandCoins,
  Beef,
  MoonStar,
  Soup,
  ShieldCheck,
  Plane,
} from "lucide-react";

const menus = [
  {
    title: "Zakat",
    href: "/campaign?category=zakat",
    icon: Landmark,
  },
  {
    title: "Infak",
    href: "/campaign?category=infak",
    icon: Heart,
  },
  {
    title: "DSKL",
    href: "/campaign?category=dskl",
    icon: HandCoins,
  },
  {
    title: "Kurban",
    href: "/campaign?category=kurban",
    icon: Beef,
  },
  {
    title: "Fitrah",
    href: "/campaign?category=fitrah",
    icon: MoonStar,
  },
  {
    title: "Fidyah",
    href: "/campaign?category=fidyah",
    icon: Soup,
  },
  {
    title: "Kafarat",
    href: "/campaign?category=kafarat",
    icon: ShieldCheck,
  },
  {
    title: "DAM",
    href: "/campaign?category=dam-haji",
    icon: Plane,
  },
];

export default function ServiceMenu() {
  return (
    <section className="mx-0 mt-4 rounded-3xl bg-white p-5 shadow-sm">
      
      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            Layanan BAZNAS NTB
          </h2>

          <p className="mt-1 text-xs font-medium text-gray-400">
            Pilih layanan yang kamu butuhkan
          </p>
        </div>

        <div className="h-8 w-1 rounded-full bg-green-600" />
      </div>

      {/* MENU GRID */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-6">
        {menus.map((menu) => {
          const Icon = menu.icon;

          return (
            <Link
              key={menu.title}
              href={menu.href}
              className="group flex flex-col items-center outline-none"
            >
              {/* ICON */}
              <div
                className="
                  relative
                  flex h-[58px] w-[58px]
                  items-center justify-center
                  rounded-[18px]
                  border border-green-100
                  bg-green-50
                  text-green-700
                  shadow-sm
                  transition-all
                  duration-300
                  ease-out

                  group-hover:-translate-y-1
                  group-hover:scale-105
                  group-hover:border-green-600
                  group-hover:bg-green-600
                  group-hover:text-white
                  group-hover:shadow-lg
                  
                  group-active:scale-95
                "
              >
                {/* EFFECT */}
                <div
                  className="
                    absolute inset-0
                    rounded-[18px]
                    bg-green-600
                    opacity-0
                    blur-md
                    transition-opacity
                    duration-300
                    group-hover:opacity-20
                  "
                />

                <Icon
                  size={26}
                  strokeWidth={2}
                  className="
                    relative z-10
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                />
              </div>

              {/* TITLE */}
              <span
                className="
                  mt-2.5
                  min-h-[28px]
                  px-1
                  text-center
                  text-[11px]
                  font-bold
                  leading-[14px]
                  text-gray-700
                  transition-all
                  duration-300
                  group-hover:-translate-y-0.5
                  group-hover:text-green-700
                "
              >
                {menu.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}