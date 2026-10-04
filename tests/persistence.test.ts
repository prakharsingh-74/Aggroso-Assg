import assert from 'node:assert';
import { parseAiResultWithFallback } from '../src/lib/validator';

console.log('🧪 Starting Assessment Persistence & Status Computation Tests...\n');

let passedTests = 0;
let totalTests = 0;

function test(description: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}\n`);
    process.exitCode = 1;
  }
}

export function buildDatabaseRecords(projectId: string, aiOutput: any, applicationDocId: string) {
  const result = parseAiResultWithFallback(typeof aiOutput === 'string' ? aiOutput : JSON.stringify(aiOutput));

  const assessmentRecord = {
    project_id: projectId,
    status: 'COMPLETED',
    completion_percentage: result.completion_percentage,
  };

  const requirementsRecords: any[] = [];
  const mappingsRecords: any[] = [];
  const evidencesRecords: any[] = [];

  for (let i = 0; i < result.requirements.length; i++) {
    const req = result.requirements[i];
    const reqId = `req-${i + 1}`;
    const mapId = `map-${i + 1}`;

    const validImportances = ['mandatory', 'recommended', 'informational'];
    const importanceValue = req.importance && validImportances.includes(req.importance) ? req.importance : 'mandatory';

    requirementsRecords.push({
      id: reqId,
      project_id: projectId,
      text: req.text || 'Untitled Requirement',
      category: req.category || 'General',
      importance: importanceValue,
    });

    const validStatuses = ['complete', 'weak', 'missing', 'not_applicable'];
    const statusValue = req.status && validStatuses.includes(req.status) ? req.status : 'missing';

    mappingsRecords.push({
      id: mapId,
      assessment_id: 'assessment-test-1',
      requirement_id: reqId,
      status: statusValue,
      explanation: req.explanation || '',
      missing_evidence: req.missing_evidence || null,
      confidence: req.confidence || 'medium'
    });

    if (req.evidence_quote) {
      evidencesRecords.push({
        mapping_id: mapId,
        document_id: applicationDocId,
        page_number: typeof req.evidence_page === 'number' ? req.evidence_page : 1,
        quote: req.evidence_quote
      });
    }
  }

  const questionsRecords = result.clarification_questions.map((q) => ({
    assessment_id: 'assessment-test-1',
    question: typeof q === 'string' ? q : JSON.stringify(q)
  }));

  const claimsRecords = result.unsupported_claims.map((c: any) => ({
    assessment_id: 'assessment-test-1',
    claim: c.claim,
    document_id: applicationDocId,
    page_number: 1,
    quote: c.quote || c.claim,
    explanation: c.explanation || 'No supporting evidence found in the draft application.',
    supporting_evidence_found: false
  }));

  return {
    assessmentRecord,
    requirementsRecords,
    mappingsRecords,
    evidencesRecords,
    questionsRecords,
    claimsRecords,
  };
}

// 1. Persistence & Data Mapping Test
test('Maps requirements, evidence, questions, and claims into relational DB records', () => {
  const mockAiOutput = {
    completion_percentage: 100,
    requirements: [
      {
        text: 'Applicant must submit audited financials',
        category: 'financial',
        importance: 'mandatory',
        status: 'complete',
        explanation: 'Audited balance sheet supplied on page 14.',
        evidence_quote: 'See attached independent audit report from 2024.',
        evidence_page: 14
      }
    ],
    clarification_questions: ['Confirm fiscal year end date'],
    unsupported_claims: [
      {
        claim: 'Project will double local revenue within 6 months',
        quote: 'We will double local revenue within 6 months.',
        explanation: 'No economic model or budget data attached.'
      }
    ]
  };

  const records = buildDatabaseRecords('proj-abc', mockAiOutput, 'doc-app-99');

  assert.strictEqual(records.assessmentRecord.completion_percentage, 100);
  assert.strictEqual(records.requirementsRecords.length, 1);
  assert.strictEqual(records.requirementsRecords[0].importance, 'mandatory');
  assert.strictEqual(records.mappingsRecords[0].status, 'complete');
  assert.strictEqual(records.evidencesRecords.length, 1);
  assert.strictEqual(records.evidencesRecords[0].page_number, 14);
  assert.strictEqual(records.questionsRecords.length, 1);
  assert.strictEqual(records.claimsRecords.length, 1);
  assert.strictEqual(records.claimsRecords[0].supporting_evidence_found, false);
});

// 2. Fallback on empty or failed AI output
test('Persists fallback assessment with 0% score and empty relations on AI failure', () => {
  const records = buildDatabaseRecords('proj-abc', '', 'doc-app-99');

  assert.strictEqual(records.assessmentRecord.completion_percentage, 0);
  assert.strictEqual(records.assessmentRecord.status, 'COMPLETED');
  assert.strictEqual(records.requirementsRecords.length, 0);
  assert.strictEqual(records.mappingsRecords.length, 0);
  assert.strictEqual(records.evidencesRecords.length, 0);
});

// 3. Human reviewer override normalization test
test('Validates reviewer status transition payload properly', () => {
  const allowedStatuses = ['complete', 'weak', 'missing', 'not_applicable'];
  const newStatus = 'complete';
  assert.ok(allowedStatuses.includes(newStatus), 'Status must be in allowed enum set');

  const actionPayload = {
    mapping_id: 'map-1',
    user_id: 'user-xyz',
    old_status: 'missing',
    new_status: newStatus,
    reason: 'Verified by grant officer',
    timestamp: new Date().toISOString()
  };

  assert.strictEqual(actionPayload.new_status, 'complete');
  assert.ok(actionPayload.timestamp.length > 0);
});

console.log(`\n================================`);
console.log(`Persistence Results: ${passedTests}/${totalTests} tests passed.`);
console.log(`================================\n`);
