import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DonasiSayaPage() {

  const user = await getCurrentUser();


  if (!user) {
    return (
      <div className="p-10">
        Silahkan login terlebih dahulu
      </div>
    );
  }



  const donations = await prisma.donation.findMany({

    where: {
      userId: user.id,
    },

    include: {
      campaign: true,
    },

    orderBy: {
      createdAt: "desc",
    },

  });



  return (

    <div className="min-h-screen bg-gray-100 p-6">


      <div className="max-w-5xl mx-auto">


        <div className="bg-white rounded-2xl shadow p-6">

          <h1 className="text-3xl font-bold text-gray-800">
            Donasi Saya
          </h1>

          <p className="text-gray-500 mt-2">
            Riwayat donasi Anda di BAZNAS NTB
          </p>


        </div>



        <div className="mt-6 space-y-4">


          {donations.length === 0 ? (

            <div className="bg-white rounded-2xl shadow p-6">

              Belum ada donasi

            </div>


          ) : (


            donations.map((item)=>(

              <div
                key={item.id}
                className="
                bg-white
                rounded-2xl
                shadow
                p-6
                "
              >


                <div className="flex justify-between">


                  <div>

                    <h2 className="text-xl font-bold">
                      {item.campaign.title}
                    </h2>


                    <p className="text-gray-500 mt-2">
                      {item.createdAt.toLocaleDateString("id-ID")}
                    </p>


                  </div>



                  <div className="text-right">


                    <p className="text-xl font-bold text-green-600">

                      Rp {item.amount.toLocaleString("id-ID")}

                    </p>


                    <span
                      className="
                      inline-block
                      mt-2
                      px-3
                      py-1
                      rounded-full
                      bg-yellow-100
                      text-yellow-700
                      text-sm
                      "
                    >

                      {item.paymentStatus}

                    </span>


                  </div>


                </div>


              </div>


            ))

          )}


        </div>


      </div>


    </div>

  );

}