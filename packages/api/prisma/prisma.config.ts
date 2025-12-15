import { defineConfig } from 'prisma';

export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL,
});
