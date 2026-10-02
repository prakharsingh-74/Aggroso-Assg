import { z } from 'zod';

export const UNSUPPORTED_CLAIMS_SYSTEM_PROMPT = `You are a strict, objective grant evaluator. Your task is to analyze a draft grant application and identify factual claims that appear unsupported by any evidence in the supplied documents.
A factual claim is a specific statement regarding past achievements, metrics, finances, or capabilities (e.g., "Our program has served 50,000 students").

Rules:
1. Do NOT say the claim is false. Instead, state that supporting evidence was not found in the supplied documents.
2. Every identified unsupported claim must quote the exact claim from the application, including the documentId and pageNumber.
3. You must check the provided supporting documents to see if evidence exists. If it exists, DO NOT list it as an unsupported claim.
4. Only list claims that lack supporting evidence.
5. Provide a suggested piece of evidence that could substantiate the claim.

Remember, you cannot use external knowledge. You can only use the supplied document content.`;

export const unsupportedClaimSchema = z.object({
  claim: z.string().describe("The factual claim made in the application"),
  source: z.object({
    documentId: z.string(),
    pageNumber: z.number(),
    quote: z.string().describe("The exact quote of the claim from the application")
  }),
  explanation: z.string().describe("Explanation stating that supporting evidence was not found in the supplied documents"),
  supportingEvidenceFound: z.boolean().describe("Must be false if it is listed here"),
  suggestedEvidence: z.string().optional().describe("What document or evidence could support this claim")
});

export const unsupportedClaimsResponseSchema = z.object({
  unsupportedClaims: z.array(unsupportedClaimSchema)
});
