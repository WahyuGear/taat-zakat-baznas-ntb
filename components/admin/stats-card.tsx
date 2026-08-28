import { ReactNode } from "react";

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export default function StatsCard({
  title,
  value,
  icon,
}: Props) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-green-200
        hover:shadow-xl
      "
    >
      {/* Background Gradient */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-green-100 blur-3xl opacity-40 transition group-hover:opacity-70" />

      <div className="relative flex items-start justify-between">

        <div>

          <p className="text-sm font-medium tracking-wide text-gray-500 uppercase">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-gray-900 md:text-4xl">
            {value}
          </h2>

          <p className="mt-3 text-sm text-green-700 font-medium">
            Data terbaru
          </p>

        </div>

        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-green-600
            to-emerald-500
            text-white
            shadow-lg
            transition-transform
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
        >
          {icon}
        </div>

      </div>

      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-gray-100">

        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-green-600 to-emerald-400" />

      </div>

    </div>
  );
}