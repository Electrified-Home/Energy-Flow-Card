import { defineConfig } from 'vite';
import { resolve } from 'path';

const debugBuild = !!(globalThis as any).process?.argv?.includes('--debug-build');
const shouldMinify = !debugBuild;
const enableSourceMap = debugBuild;

export default defineConfig({
  build: {
    minify: shouldMinify ? 'esbuild' : false,
    sourcemap: enableSourceMap,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MeteredHomeEnergyFlowCard',
      fileName: () => 'metered-home-energy-flow-card.js',
      formats: ['iife']
    },
    outDir: resolve(__dirname, 'dist')
  }
});
