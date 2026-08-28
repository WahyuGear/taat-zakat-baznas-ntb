type Props = {
  target: number;
  collected: number;
  percentage: number;
};

export default function SummaryCard({
  target,
  collected,
  percentage,
}: Props) {
  const progress = Math.min(
    100,
    Math.max(0, percentage)
  );

  return (
    <div className="rounded-3xl bg-green-700 p-6 text-white shadow-lg">
      <p className="text-sm font-medium">
        Ringkasan Donasi
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <div>
          <p className="text-xs opacity-70">
            Target
          </p>

          <p className="mt-1 text-xl font-bold">
            Rp {target.toLocaleString("id-ID")}
          </p>
        </div>

        <div>
          <p className="text-xs opacity-70">
            Terkumpul
          </p>

          <p className="mt-1 text-xl font-bold">
            Rp {collected.toLocaleString("id-ID")}
          </p>
        </div>

        <div>
          <p className="text-xs opacity-70">
            Progress
          </p>

          <p className="mt-1 text-xl font-bold">
            {percentage.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white"
          style={{
            width: progress + "%",
          }}
        />
      </div>
    </div>
  );
}