import { defineConfig } from '@pandacss/dev'
import basePreset from '@pandacss/preset-base'
import pandaPreset from '@pandacss/preset-panda'

export default defineConfig({
  presets: [basePreset, pandaPreset],
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      tokens: {
        colors: { brand: { value: '#4f46e5' }, canvas: { value: '#f8fafc' } },
        spacing: { layout: { value: '1.5rem' } },
      },
    },
  },
  outdir: 'styled-system',
  jsxFramework: 'react',
})
