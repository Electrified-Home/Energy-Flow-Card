import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  define: {
    'process.env': '{}',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EnergyFlowChartedCard',
      fileName: 'home-energy-flow-graph-card',
      formats: ['iife'],
    },
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'home-energy-flow-graph-card.js',
        assetFileNames: '[name][extname]',
      },
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../shared/src'),
    },
  },
});
