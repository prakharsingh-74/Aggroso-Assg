import assert from 'node:assert';
import { validateUploadPayload, parseAiResultWithFallback, MAX_FILE_SIZE } from '../src/lib/validator';
import { calculateGeminiCost, logger } from '../src/lib/logger';

console.log('🧪 Starting Aggroso Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function test(description: string, fn: () => void | Promise<void>) {
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

async function runTests() {
  console.log('--- 1. API Validation & Payload Limits ---');

  test('Rejects request when guideline file is missing', () => {
    const result = validateUploadPayload(null, { name: 'app.pdf', type: 'application/pdf', size: 1024 });
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.status, 400);
    assert.match(result.error || '', /Guideline and Application files are required/);
  });

  test('Rejects request when application file is missing', () => {
    const result = validateUploadPayload({ name: 'guide.pdf', type: 'application/pdf', size: 1024 }, null);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.status, 400);
    assert.match(result.error || '', /Guideline and Application files are required/);
  });

  test('Rejects non-PDF file upload (e.g., text/plain or image/png)', () => {
    const result = validateUploadPayload(
      { name: 'guide.docx', type: 'application/msword', size: 1024 },
      { name: 'app.pdf', type: 'application/pdf', size: 1024 }
    );
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.status, 400);
    assert.match(result.error || '', /is not a valid PDF/);
  });

  test('Rejects supporting document that is not a PDF', () => {
    const result = validateUploadPayload(
      { name: 'guide.pdf', type: 'application/pdf', size: 1024 },
      { name: 'app.pdf', type: 'application/pdf', size: 1024 },
      [{ name: 'data.xlsx', type: 'application/vnd.ms-excel', size: 2048 }]
    );
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.status, 400);
    assert.match(result.error || '', /is not a valid PDF/);
  });

  test(`Rejects file exceeding max limit of 25MB (${MAX_FILE_SIZE} bytes)`, () => {
    const oversized = MAX_FILE_SIZE + 1024; // 25MB + 1KB
    const result = validateUploadPayload(
      { name: 'huge-guideline.pdf', type: 'application/pdf', size: oversized },
      { name: 'app.pdf', type: 'application/pdf', size: 1024 }
    );
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.status, 400);
    assert.match(result.error || '', /exceeds the maximum allowed size of 25MB/);
  });

  test('Accepts valid guideline, application, and supporting PDFs within 25MB limit', () => {
    const result = validateUploadPayload(
      { name: 'guideline.pdf', type: 'application/pdf', size: 5 * 1024 * 1024 },
      { name: 'application.pdf', type: 'application/pdf', size: 8 * 1024 * 1024 },
      [{ name: 'supporting.pdf', type: 'application/pdf', size: 2 * 1024 * 1024 }]
    );
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.error, undefined);
  });

  console.log('\n--- 2. AI Parsing Fallback & Resilience ---');

  test('Handles completely empty string response without throwing', () => {
    const parsed = parseAiResultWithFallback('');
    assert.strictEqual(parsed.isFallback, true);
    assert.strictEqual(parsed.completion_percentage, 0);
    assert.deepStrictEqual(parsed.requirements, []);
  });

  test('Handles corrupted/malformed JSON string gracefully', () => {
    const malformed = '{"completion_percentage": 75, "requirements": ['; // Incomplete JSON
    const parsed = parseAiResultWithFallback(malformed);
    assert.strictEqual(parsed.isFallback, true);
    assert.strictEqual(parsed.completion_percentage, 0);
    assert.deepStrictEqual(parsed.requirements, []);
  });

  test('Correctly parses valid AI JSON payload', () => {
    const validJson = JSON.stringify({
      completion_percentage: 85,
      requirements: [
        {
          text: 'Must be registered 501(c)(3)',
          category: 'eligibility',
          importance: 'mandatory',
          status: 'complete',
          evidence_quote: 'We are a 501(c)(3) nonprofit.',
          evidence_page: 2
        }
      ],
      clarification_questions: ['Provide recent annual audit report'],
      unsupported_claims: []
    });

    const parsed = parseAiResultWithFallback(validJson);
    assert.strictEqual(parsed.isFallback, false);
    assert.strictEqual(parsed.completion_percentage, 85);
    assert.strictEqual(parsed.requirements.length, 1);
    assert.strictEqual(parsed.requirements[0].text, 'Must be registered 501(c)(3)');
    assert.strictEqual(parsed.clarification_questions.length, 1);
  });

  console.log('\n--- 3. Observability, Cost Calculation & Logging ---');

  test('Calculates Gemini 2.5 Flash token costs accurately', () => {
    // 1,000,000 prompt tokens = $0.075, 1,000,000 response tokens = $0.30
    const cost = calculateGeminiCost(1_000_000, 1_000_000);
    assert.strictEqual(cost, 0.375);

    // Standard run: 2000 input tokens, 500 output tokens
    const sampleCost = calculateGeminiCost(2000, 500);
    assert.ok(sampleCost > 0);
    assert.ok(sampleCost < 0.001); // Less than 1/10th of a cent
  });

  test('Logger outputs structured JSON with event metadata', () => {
    let capturedLog = '';
    const originalLog = console.log;
    console.log = (msg: string) => { capturedLog = msg; };

    logger.info('Test event triggered', {
      event: 'test_event',
      projectId: 'proj-123',
      tokens: { promptTokens: 100, responseTokens: 50, totalTokens: 150 },
      status: 'success'
    });

    console.log = originalLog;

    const parsed = JSON.parse(capturedLog);
    assert.strictEqual(parsed.level, 'INFO');
    assert.strictEqual(parsed.event, 'test_event');
    assert.strictEqual(parsed.projectId, 'proj-123');
    assert.strictEqual(parsed.service, 'aggroso-backend');
    assert.strictEqual(parsed.tokens.totalTokens, 150);
  });

  console.log(`\n================================`);
  console.log(`Test Results: ${passedTests}/${totalTests} tests passed.`);
  console.log(`================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
