import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'

export default {
  input: 'src/energy-flow-card.ts',
  output: {
    file: 'energy-flow-card.js',
    format: 'iife',
    name: 'EnergyFlowCard',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
    }),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
}
