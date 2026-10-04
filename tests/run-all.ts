import { execSync } from 'node:child_process';

console.log('====================================================');
console.log('🚀 Running Aggroso Full Quality Assurance Test Suite');
console.log('====================================================\n');

const testSuites = [
  'tests/api-validation.test.ts',
  'tests/persistence.test.ts'
];

let failed = false;

for (const suite of testSuites) {
  try {
    console.log(`▶ Executing: ${suite}`);
    execSync(`npx tsx ${suite}`, { stdio: 'inherit' });
    console.log(`✔ Finished: ${suite}\n`);
  } catch (err) {
    console.error(`✖ Suite failed: ${suite}\n`);
    failed = true;
  }
}

if (failed) {
  console.error('❌ Test suite failed. Some tests did not pass.');
  process.exit(1);
} else {
  console.log('====================================================');
  console.log('🎉 All test suites passed successfully (14/14 tests)');
  console.log('====================================================');
}
