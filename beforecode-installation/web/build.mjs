import { access, copyFile } from 'node:fs/promises';
for (const path of ['public/index.html','public/app.js','public/style.css','api/workspace.js','vendor/templates/prd.md']) await access(path);
await copyFile('vendor/LICENSE','public/LICENSE.txt');
console.log('BeforeCode browser application and original engine ready. No external dependencies.');
