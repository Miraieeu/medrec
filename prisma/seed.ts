import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("dummy", 10);

  await prisma.user.createMany({
    data: [
      {
        id: 1,
        email: "registration@medrec.local",
        name: "Petugas Pendaftaran",
        password: hashedPassword,
        role: Role.registration,
      },
      {
        id: 2,
        email: "nurse@medrec.local",
        name: "Perawat",
        password: hashedPassword,
        role: Role.nurse,
      },
      {
        id: 3,
        email: "doctor@medrec.local",
        name: "Dokter",
        password: hashedPassword,
        role: Role.doctor,
      },
      {
        id: 99,
        email: "admin@medrec.local",
        name: "Admin",
        password: hashedPassword,
        role: Role.admin,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ User seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
