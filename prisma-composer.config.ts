import { defineConfig } from "@prisma/composer";
import { prismaCloud } from "@prisma/composer-prisma-cloud";
import { nextjsBuild } from "@prisma/composer/nextjs";

export default defineConfig({
  target: prismaCloud(),
  builds: [nextjsBuild()],
});
