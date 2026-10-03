import { compute } from "@prisma/composer-prisma-cloud";
import { postgres, dataContract } from "@prisma/composer-prisma-cloud/orm";
import nextjs from "@prisma/composer/nextjs";
import schemaJson from "./prisma/schema.json" with { type: "json" };

export const contract = dataContract(schemaJson);

export default compute({
  name: "web",
  deps: { db: postgres(contract) },
  build: nextjs({ module: import.meta.url, appDir: "./" }),
});
