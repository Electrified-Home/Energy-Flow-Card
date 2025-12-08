import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Toggle debug build with CLI flag: `vite build --debug-build`
const debugBuild = process.argv.includes('--debug-build');
const shouldMinify = !debugBuild;
// Default builds skip source maps; enable with --debug-build when you need them.
const enableSourceMap = debugBuild;

export default defineConfig({
  build: {
    minify: shouldMinify ? 'esbuild' : false,
    sourcemap: enableSourceMap,
    lib: {
      entry: resolve(__dirname, 'src/energy-flow-card.ts'),
      name: 'EnergyFlowCard',
      fileName: 'energy-flow-card',
      formats: ['iife']
    },
    outDir: 'dist',
    emptyOutDir: true,
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
