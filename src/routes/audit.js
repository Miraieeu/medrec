const router = require("express").Router();
const { prisma } = require("../prisma");

router.get("/", async (req, res) => {
  const audits = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: { email: true, role: true }
      }
    }
  });

  res.json(audits);
});

module.exports = router;
