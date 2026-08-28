import { prisma } from "@/lib/prisma";

export default async function DonorDetail({
  params,
}:{
  params:Promise<{
    email:string
  }>
}){

const {email}=await params

const donor=await prisma.donation.findMany({

where:{
email:decodeURIComponent(email)
},

include:{
campaign:true
},

orderBy:{
createdAt:"desc"
}

})

if(donor.length===0){

return(
<div>
Donatur tidak ditemukan
</div>
)

}

const total=donor.reduce(

(sum,item)=>sum+item.amount,

0

)

return(

<div className="space-y-8">

<h1 className="text-4xl font-bold">

{donor[0].donorName}

</h1>

<div className="rounded-3xl border bg-white p-6">

<p>

Email :

<b>

{donor[0].email}

</b>

</p>

<p className="mt-3">

Total Donasi :

<b>

Rp {total.toLocaleString("id-ID")}

</b>

</p>

<p className="mt-3">

Jumlah Donasi :

<b>

{donor.length}

</b>

</p>

</div>

<div className="rounded-3xl border bg-white">

<table className="w-full">

<thead className="bg-gray-100">

<tr>

<th className="p-4">
Campaign
</th>

<th className="p-4">
Nominal
</th>

<th className="p-4">
Status
</th>

<th className="p-4">
Tanggal
</th>

</tr>

</thead>

<tbody>

{donor.map(item=>(

<tr
key={item.id}
className="border-t"
>

<td className="p-4">

{item.campaign.title}

</td>

<td className="p-4 font-bold text-green-700">

Rp {item.amount.toLocaleString("id-ID")}

</td>

<td className="p-4">

{item.paymentStatus}

</td>

<td className="p-4">

{new Date(item.createdAt).toLocaleDateString("id-ID")}

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}