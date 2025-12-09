import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: [
        'compact/src/**/*.ts',
        'metered/src/**/*.ts',
        'shared/src/**/*.ts'
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.d.ts',
        'shared/src/types/**'
      ],
    },
  },
});
