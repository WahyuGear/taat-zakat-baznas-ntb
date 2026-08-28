import Image from "next/image";
import Link from "next/link";


type Campaign = {
  title: string;
  target: number;
  collected: number;
};



export default function Hero({
  campaign,
}: {
  campaign: Campaign | null;
}) {


  const percentage = campaign
    ? Math.min(
        Math.round(
          (campaign.collected / campaign.target) * 100
        ),
        100
      )
    : 0;



  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-white">


      {/* Background */}

      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-green-200/30 blur-3xl" />

      <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-emerald-100/30 blur-3xl" />




      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 md:px-6 lg:grid-cols-2 lg:py-20">





        {/* LEFT CONTENT */}


        <div>


          <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">

            💚 BAZNAS NTB : Transformasi Mustahik Menjadi Muzaki

          </span>





          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl">

            Bersama BAZNAS NTB Wujudkan

            <br />

            <span className="text-green-700">
              NTB Makmur Mendunia
            </span>

          </h1>





          <p className="mt-6 max-w-xl text-base leading-8 text-gray-600 md:text-lg">

            Salurkan zakat, infak, sedekah, dan dana kemanusiaan
            secara aman, transparan, dan amanah melalui BAZNAS NTB.

          </p>





          <div className="mt-8 flex flex-wrap gap-4">


            <Link
              href="/campaign"
              className="rounded-xl bg-green-700 px-7 py-4 font-bold text-white transition hover:bg-green-800"
            >

              Tunaikan Zakat

            </Link>



            <Link
              href="/campaign"
              className="rounded-xl border border-green-700 px-7 py-4 font-bold text-green-700 transition hover:bg-green-700 hover:text-white"
            >

              Lihat Program

            </Link>


          </div>








          {/* Statistik */}


          <div className="mt-10 grid grid-cols-3 gap-5">


            <div className="rounded-2xl bg-white p-4 shadow">

              <h3 className="text-2xl font-extrabold text-green-700">
                25K+
              </h3>

              <p className="text-sm text-gray-500">
                Muzaki
              </p>

            </div>




            <div className="rounded-2xl bg-white p-4 shadow">

              <h3 className="text-2xl font-extrabold text-green-700">
                Rp2,8 M
              </h3>

              <p className="text-sm text-gray-500">
                Zakat Terkumpul
              </p>

            </div>




            <div className="rounded-2xl bg-white p-4 shadow">

              <h3 className="text-2xl font-extrabold text-green-700">
                520+
              </h3>

              <p className="text-sm text-gray-500">
                Program
              </p>

            </div>


          </div>



        </div>









        {/* RIGHT IMAGE */}



        <div className="relative flex justify-center pb-12">



          <div className="overflow-hidden rounded-[35px] shadow-2xl">


            <Image
              src="https://res.cloudinary.com/qim0fcuj/image/upload/v1785084297/hero_ghsmpj.jpg"
              alt="Hero BAZNAS NTB"
              width={450}
              height={550}
              priority
              className="h-[600px] w-[400px] object-cover rounded-[35px]"
            />


          </div>









          {/* TOP CAMPAIGN */}



          <div className="absolute -bottom-5 left-1/2 w-72 -translate-x-1/2 rounded-3xl bg-white p-5 shadow-2xl">



            <p className="text-sm font-semibold text-gray-500">
              🔥 Top Campaign
            </p>





            <h3 className="mt-2 font-bold text-gray-900">

              {campaign?.title || "Program Unggulan BAZNAS NTB"}

            </h3>





            <p className="mt-2 text-xl font-bold text-green-700">

              Rp {campaign?.collected?.toLocaleString("id-ID") || "0"}

            </p>






            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">


              <div
                className="h-full rounded-full bg-green-600"
                style={{
                  width: `${percentage}%`,
                }}
              />


            </div>






            <div className="mt-3 flex justify-between text-xs text-gray-500">


              <span>
                Target Rp {campaign?.target?.toLocaleString("id-ID") || "0"}
              </span>



              <span>
                {percentage}%
              </span>


            </div>



          </div>



        </div>





      </div>


    </section>
  );
}