import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '.',
  css: false,
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
});
