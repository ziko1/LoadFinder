import fs from 'node:fs';
const required=[
  'src/v24/autoSearchPolicy.test.ts',
  'src/v24/workerState.test.ts',
  'src/v25/pipeline.test.ts',
  'src/v25/notificationOutbox.test.ts',
  'src/v26/integrationContract.test.ts',
  'src/v27/pipelineContracts.test.ts'
];
const missing=required.filter(x=>!fs.existsSync(new URL('../'+x,import.meta.url)));
if(missing.length){console.error('Missing tests:',missing);process.exit(1);}
console.log('CI preflight: PASS');
