interface Campaign {
    id: number;
    title: string;
    target: number;
    collected: number;
  }
  
  export default function TopCampaign({
    campaigns,
  }: {
    campaigns: Campaign[];
  }) {
    return (
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
  
        <h2 className="mb-6 text-2xl font-bold">
          🔥 Top Campaign
        </h2>
  
        <div className="space-y-5">
  
          {campaigns.map((item) => {
  
            const progress =
              item.target > 0
                ? (item.collected / item.target) * 100
                : 0;
  
            return (
              <div key={item.id}>
  
                <div className="mb-2 flex items-center justify-between">
  
                  <h3 className="font-semibold">
                    {item.title}
                  </h3>
  
                  <span className="font-bold text-green-700">
                    Rp {item.collected.toLocaleString("id-ID")}
                  </span>
  
                </div>
  
                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
  
                  <div
                    className="h-full rounded-full bg-green-600"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
  
                </div>
  
              </div>
            );
          })}
  
        </div>
  
      </div>
    );
  }