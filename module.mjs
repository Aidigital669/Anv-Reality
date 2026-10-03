// @ts-check
import { module } from "@prisma/composer";
import { postgres, dataContract } from "@prisma/composer-prisma-cloud/orm";
import tempContractJson from "./src/prisma/contract.json" with { type: "json" };
import tempService from "./service.mjs";

export default module("temp", ({ provision }) => {
  const database = provision(postgres({ name: "database", contract: dataContract(tempContractJson), config: "./prisma.config.ts" }));
  provision(tempService, { deps: { db: database } });
});
