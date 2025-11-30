import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const distFile = join(projectRoot, 'dist', 'energy-flow-card.js')
const hacsDir = join(projectRoot, 'hacs')
const targetFile = join(hacsDir, 'energy-flow-card.js')

if (!existsSync(distFile)) {
  throw new Error('dist/energy-flow-card.js not found. Run "pnpm build" first.')
}

mkdirSync(hacsDir, { recursive: true })
copyFileSync(distFile, targetFile)

console.log(`✔ Copied ${distFile} -> ${targetFile}`)
