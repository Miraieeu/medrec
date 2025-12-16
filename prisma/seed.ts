import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        id: 1,
        email: "registration@medrec.local",
        name: "Petugas Pendaftaran",
        password: "dummy",
        role: Role.registration,
      },
      {
        id: 2,
        email: "nurse@medrec.local",
        name: "Perawat",
        password: "dummy",
        role: Role.nurse,
      },
      {
        id: 3,
        email: "doctor@medrec.local",
        name: "Dokter",
        password: "dummy",
        role: Role.doctor,
      },
      {
        id: 99,
        email: "admin@medrec.local",
        name: "Admin",
        password: "dummy",
        role: Role.admin,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ User seed inserted");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
