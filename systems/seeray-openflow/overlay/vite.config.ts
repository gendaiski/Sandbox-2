import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import path from 'node:path'
export default defineConfig({plugins:[solid()],resolve:{alias:{'@opencode-ai/sdk/v2/client':path.resolve('vendor/sdk/src/v2/client.ts')}},build:{outDir:'dist'}})
