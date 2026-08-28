type ProgressProps = {
  current: number;
  target: number;
};

export default function Progress({
  current,
  target,
}: ProgressProps) {
  const percent = (current / target) * 100;

  return (
    <div className="mt-5">

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

        <div
          className="h-full bg-green-600"
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

      <div className="flex justify-between mt-2 text-sm">

        <span className="font-semibold text-green-700">
          Rp {current.toLocaleString("id-ID")}
        </span>

        <span className="text-gray-500">
          Target Rp {target.toLocaleString("id-ID")}
        </span>

      </div>

    </div>
  );
}