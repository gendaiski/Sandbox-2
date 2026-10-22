import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  base: './', // relative asset URLs, so the build works from any path
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    // Prism ships ESM with a CSS import; let Vite transform it.
    server: { deps: { inline: [/@nanisoft\/prism-ui/] } },
    css: true,
  },
})
