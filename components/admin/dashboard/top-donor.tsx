interface Donor {
    donorName: string;
    amount: number;
  }
  
  interface Props {
    donors: Donor[];
  }
  
  export default function TopDonor({
    donors,
  }: Props) {
    return (
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
  
        <h2 className="mb-6 text-2xl font-bold">
          🏆 Top Donatur
        </h2>
  
        <div className="space-y-4">
  
          {donors.map((item, index) => (
  
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border p-4 hover:bg-gray-50"
            >
  
              <div>
  
                <p className="font-bold">
                  #{index + 1} {item.donorName}
                </p>
  
              </div>
  
              <p className="font-bold text-green-700">
                Rp {item.amount.toLocaleString("id-ID")}
              </p>
  
            </div>
  
          ))}
  
        </div>
  
      </div>
    );
  }