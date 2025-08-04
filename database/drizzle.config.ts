import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import * as process from 'node:process';

export default defineConfig({
    out: './drizzle',
    schema: './schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.DB! || 'file:local.db',
    },
});
