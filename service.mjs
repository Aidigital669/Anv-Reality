// @ts-check
import nextjs from "@prisma/composer/nextjs";
import { compute } from "@prisma/composer-prisma-cloud";
import { postgres, dataContract } from "@prisma/composer-prisma-cloud/orm";
import tempContractJson from "./src/prisma/contract.json" with { type: "json" };

export default compute({
  name: "temp",
  deps: { db: postgres(dataContract(tempContractJson)) },
  build: nextjs({ module: import.meta.url, appDir: "." }),
});
