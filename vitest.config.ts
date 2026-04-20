import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    server: {
      deps: {
        inline: ['zod'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'bun:sqlite': path.resolve(__dirname, 'tests/__mocks__/bun-sqlite.ts'),
    },
  },
});
