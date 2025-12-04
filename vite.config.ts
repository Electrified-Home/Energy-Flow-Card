import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/energy-flow-card.ts'),
      name: 'EnergyFlowCard',
      fileName: 'energy-flow-card',
      formats: ['iife']
    },
    outDir: '.',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        extend: true,
        entryFileNames: 'energy-flow-card.js'
      }
    }
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts',
        'vite.config.ts'
      ]
    }
  }
});
