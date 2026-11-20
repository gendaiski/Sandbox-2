import { defineConfig } from 'vite';
import { mkdir, copyFile } from 'node:fs/promises';
// Every previously shared URL must show the same official website renderer.
// Generate aliases from one built entry rather than maintaining competing shaders.
export default defineConfig({
  build:{target:'es2022'},
  plugins:[{
    name:'website-preview-aliases',
    async closeBundle(){
      for(const route of ['desktop','orb']){
        await mkdir(`dist/${route}`,{recursive:true});
        await copyFile('dist/index.html',`dist/${route}/index.html`);
      }
    }
  }]
});
