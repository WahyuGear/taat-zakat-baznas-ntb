export default function AppContainer({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen bg-[#EEF3F8]">
  
        <div className="mx-auto flex min-h-screen max-w-[1600px] items-center justify-center gap-10 p-8">
  
          {/* Left */}
  
          <div className="hidden w-[360px] xl:flex flex-col justify-center">
  
            <img
              src="/images/desktop-left.png"
              alt="BAZNAS"
              className="w-full"
            />
  
          </div>
  
          {/* Mobile App */}
  
          <div className="relative w-full max-w-[430px] overflow-hidden rounded-[36px] bg-white shadow-[0_20px_60px_rgba(0,0,0,.18)]">
  
            {children}
  
          </div>
  
          {/* Right */}
  
          <div className="hidden w-[360px] xl:flex flex-col justify-center">
  
            <img
              src="/images/desktop-right.png"
              alt="BAZNAS"
              className="w-full"
            />
  
          </div>
  
        </div>
  
      </div>
    );
  }