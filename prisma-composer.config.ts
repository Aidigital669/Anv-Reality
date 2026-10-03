import { defineConfig } from "@prisma/composer/config";
import { prismaCloud, prismaState } from "@prisma/composer-prisma-cloud/control";
import { nextjsBuild } from "@prisma/composer/nextjs/control";

export default defineConfig({
  extensions: [prismaCloud({ region: "us-east-1" }), nextjsBuild()],
  state: prismaState(),
});
