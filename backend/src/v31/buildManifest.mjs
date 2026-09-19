import fs from 'node:fs';
const required=['package.json','tsconfig.json','src/server.ts'];
const missing=required.filter(x=>!fs.existsSync(new URL('../../'+x,import.meta.url)));
if(missing.length){console.error('Missing build inputs:',missing);process.exit(1);}
console.log('Build input audit: PASS');
