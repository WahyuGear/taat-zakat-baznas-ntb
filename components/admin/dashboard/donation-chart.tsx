"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: {
    month: string;
    total: number;
  }[];
}

export default function DonationChart({ data }: Props) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">

      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Grafik Donasi
        </h2>

        <p className="text-sm text-gray-500">
          Perkembangan donasi per bulan
        </p>
      </div>

      <div className="h-[350px]">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={data}>

            <defs>

              <linearGradient
                id="colorDonation"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#16a34a"
                  stopOpacity={0.35}
                />

                <stop
                  offset="95%"
                  stopColor="#16a34a"
                  stopOpacity={0}
                />

              </linearGradient>

            </defs>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip
  formatter={(value) =>
    `Rp ${Number(value ?? 0).toLocaleString("id-ID")}`
  }
/>

            <Area
              type="monotone"
              dataKey="total"
              stroke="#16a34a"
              strokeWidth={3}
              fill="url(#colorDonation)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}