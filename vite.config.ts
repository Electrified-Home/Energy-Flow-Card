import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const cardEntry = resolve(__dirname, 'src/energy-flow-card.ts')
const previewEntry = resolve(__dirname, 'src/dev-preview.ts')

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'energy-flow-card': cardEntry,
        'dev-preview': previewEntry,
      },
      output: {
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === 'energy-flow-card' ? 'energy-flow-card.js' : 'dev-preview.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
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
