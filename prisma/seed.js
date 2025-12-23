"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const hashedPassword = await bcryptjs_1.default.hash("dummy", 10);
    await prisma.user.createMany({
        data: [
            {
                id: 1,
                email: "registration@medrec.local",
                name: "Petugas Pendaftaran",
                password: hashedPassword,
                role: client_1.Role.registration,
            },
            {
                id: 2,
                email: "nurse@medrec.local",
                name: "Perawat",
                password: hashedPassword,
                role: client_1.Role.nurse,
            },
            {
                id: 3,
                email: "doctor@medrec.local",
                name: "Dokter",
                password: hashedPassword,
                role: client_1.Role.doctor,
            },
            {
                id: 99,
                email: "admin@medrec.local",
                name: "Admin",
                password: hashedPassword,
                role: client_1.Role.admin,
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
