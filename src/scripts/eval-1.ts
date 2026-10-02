import 'dotenv/config';
import { REQUIREMENT_EXTRACTION_SYSTEM_PROMPT, requirementExtractionSchema } from '../lib/ai/prompts/requirementExtraction';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SAMPLE_GUIDELINE = `
Community Development Grant 2026 - Official Guidelines

1. Eligibility
To be eligible for this grant, the applicant must be a registered nonprofit organization with 501(c)(3) status.
The applicant must have operated continuously for at least 3 years prior to the application date.

2. Project Requirements
The proposed project must directly serve residents of the state. 
Applicants are encouraged to demonstrate community impact through letters of support from local leaders.
The application must include a detailed project description and a complete project budget.

3. Documentation
The applicant must submit its latest annual report.
A copy of the most recent financial statement should also be provided if available.
`;

const USER_PROMPT = `
Please extract the requirements from the following grant guideline document.

Document ID: doc-guideline-123

Document Text:
[PAGE 1]
${SAMPLE_GUIDELINE}
`;

async function run() {
  console.log("=== EVALUATION CHECKPOINT 1 ===");
  console.log("Running Gemini Extraction...\n");

  const schema = zodToJsonSchema(requirementExtractionSchema as any, "RequirementsSchema");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: USER_PROMPT,
      config: {
        systemInstruction: REQUIREMENT_EXTRACTION_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: (schema as any).definitions.RequirementsSchema,
        temperature: 0.1,
      }
    });

    console.log("Gemini Output:");
    console.log(response.text);

  } catch (error) {
    console.error("Error calling Gemini:", error);
  }
}

run();
