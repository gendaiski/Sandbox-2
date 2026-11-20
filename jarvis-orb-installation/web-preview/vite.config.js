import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({build:{target:'es2022',rollupOptions:{input:{website:resolve('index.html'),desktop:resolve('desktop/index.html'),orb:resolve('orb/index.html')}}}});
