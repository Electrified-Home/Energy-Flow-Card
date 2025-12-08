import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Toggle debug build with CLI flag: `vite build --debug-build`
const debugBuild = process.argv.includes('--debug-build');
const shouldMinify = !debugBuild;
// Default builds skip source maps; enable with --debug-build when you need them.
const enableSourceMap = debugBuild;

// Determine which card to build from environment variable
const buildCard = process.env.BUILD_CARD || 'energy-flow-card';

const entryMap: Record<string, { entry: string; name: string }> = {
  'energy-flow-card': {
    entry: resolve(__dirname, 'src/energy-flow-card.ts'),
    name: 'EnergyFlowCard'
  },
  'compact-home-energy-flow-card': {
    entry: resolve(__dirname, 'src/compact-home-energy-flow-card.ts'),
    name: 'CompactHomeEnergyFlowCard'
  },
  'metered-home-energy-flow-card': {
    entry: resolve(__dirname, 'src/metered-home-energy-flow-card.ts'),
    name: 'MeteredHomeEnergyFlowCard'
  }
};

const config = entryMap[buildCard];

export default defineConfig({
  build: {
    minify: shouldMinify ? 'esbuild' : false,
    sourcemap: enableSourceMap,
    lib: {
      entry: config.entry,
      name: config.name,
      fileName: buildCard,
      formats: ['iife']
    },
    outDir: 'dist',
    emptyOutDir: false, // Don't empty so both builds can coexist
    rollupOptions: {
      output: {
        extend: true,
        entryFileNames: `${buildCard}.js`
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
