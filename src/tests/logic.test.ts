import assert from 'assert';

function calculateCompletion(mappings: any[]) {
  let totalMandatory = 0;
  let completeMandatory = 0;

  mappings.forEach(mapping => {
    // Note: Human review logic would resolve finalStatus first
    const finalStatus = mapping.status;
    if (mapping.importance === 'mandatory' && finalStatus !== 'not_applicable') {
      totalMandatory++;
      if (finalStatus === 'complete') {
        completeMandatory++;
      }
    }
  });

  return totalMandatory === 0 ? 100 : Math.round((completeMandatory / totalMandatory) * 100);
}

function verifyCitation(sourceText: string, quote: string) {
  return sourceText.includes(quote);
}

function isAssessmentStale(currentGuidelineHash: string, currentAppHash: string, assessmentGuidelineHash: string, assessmentAppHash: string) {
  return currentGuidelineHash !== assessmentGuidelineHash || currentAppHash !== assessmentAppHash;
}

console.log("Running Tests...");

// 1. Deterministic Calculation Test
const mappings1 = [
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'weak' },
  { importance: 'mandatory', status: 'weak' },
  { importance: 'mandatory', status: 'missing' },
];
assert.strictEqual(calculateCompletion(mappings1), 70, "70% calculation failed");

const mappings2 = [
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'complete' },
  { importance: 'mandatory', status: 'not_applicable' },
  { importance: 'mandatory', status: 'not_applicable' },
  { importance: 'mandatory', status: 'missing' },
];
// 7 complete out of 8 applicable = 7/8 = 87.5% -> round to 88
assert.strictEqual(calculateCompletion(mappings2), 88, "87.5% rounding calculation failed");

// 2. Citation Verification Test
const sampleText = "The applicant must have operated continuously for at least 3 years prior to the application date.";
assert.strictEqual(verifyCitation(sampleText, "operated continuously for at least 3 years"), true, "Valid citation failed");
assert.strictEqual(verifyCitation(sampleText, "operated for 5 years"), false, "Invalid citation failed");

// 3. Stale Detection Test
assert.strictEqual(isAssessmentStale('hashA', 'hashB', 'hashA', 'hashB'), false, "Not stale failed");
assert.strictEqual(isAssessmentStale('hashA_mod', 'hashB', 'hashA', 'hashB'), true, "Stale guideline failed");
assert.strictEqual(isAssessmentStale('hashA', 'hashB_mod', 'hashA', 'hashB'), true, "Stale app failed");

console.log("All tests passed successfully!");
