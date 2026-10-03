import { module } from "@prisma/composer";
import { postgres } from "@prisma/composer-prisma-cloud/orm";
import webService, { contract } from "./service.ts";

export default module("anvrealty", ({ provision }) => {
  // Provision the Prisma Postgres database with migration tracking
  const database = provision(
    postgres({
      name: "database",
      contract,
      config: "./prisma.config.ts",
    })
  );

  // Provision the Next.js web service
  provision(webService, {
    deps: { db: database },
  });
});
