import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const cardEntry = resolve(__dirname, 'src/energy-flow-card.ts')

export default defineConfig({
  build: {
    lib: {
      entry: cardEntry,
      formats: ['iife'],
      name: 'EnergyFlowCard',
      fileName: () => 'energy-flow-card.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    emptyOutDir: true,
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
