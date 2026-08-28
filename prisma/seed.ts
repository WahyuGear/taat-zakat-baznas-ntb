import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.campaign.create({
    data: {
      title: "Sedekah Subuh",
      slug: "sedekah-subuh",
      description: "Sedekah Subuh BAZNAS NTB",
      image: "/images/sedekah-subuh.jpg",
      target: 50000000,
      collected: 28000000,
      category: "Sedekah",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });