import { module, compute } from "@prisma/composer";
import { postgres } from "@prisma/composer-prisma-cloud/orm";
import { nextjs } from "@prisma/composer/nextjs";
import { dataContract } from "@prisma/composer-prisma-cloud/orm";

export default module("anvrealty", ({ provision }) => {
  // Provision a PostgreSQL database and wire the Prisma ORM schema
  const db = provision(postgres, {
    contract: dataContract({
      module: import.meta.url,
      path: "./prisma/schema.json", // Output of prisma contract emit
      prismaConfigPath: "./prisma.config.ts",
    }),
  });

  // Provision the Next.js app
  provision(compute, {
    name: "web",
    deps: { db },
    build: nextjs({ module: import.meta.url, appDir: "./" }),
  });
});
