const { PrismaClient } = require("../lib/generated/prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");
const adapter = new PrismaLibSql({ url: "./prisma/dev.db" });
const p = new PrismaClient({ adapter });

p.user
  .findMany()
  .then((u) => {
    u.forEach((x) =>
      console.log(x.email, x.role, x.status, x.isActive)
    );
  })
  .catch((e) => console.error(e))
  .finally(() => p.$disconnect());
