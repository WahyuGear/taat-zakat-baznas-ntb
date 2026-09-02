import { prisma } from "./lib/prisma";
import { hashPassword } from "./lib/auth/password";

async function main() {
  const email = "superadmin@baznasntb.com";
  const password = "AdminBaznas2026!";

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    create: {
      name: "Super Admin BAZNAS NTB",
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("");
  console.log("=================================");
  console.log("   ADMIN BAZNAS NTB BERHASIL");
  console.log("=================================");
  console.log("Email    :", user.email);
  console.log("Password :", password);
  console.log("Role     :", user.role);
  console.log("=================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });