export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
  status?: number;
}

export function validateUploadPayload(
  guideline: { name?: string; type?: string; size?: number } | null | undefined,
  application: { name?: string; type?: string; size?: number } | null | undefined,
  supporting: Array<{ name?: string; type?: string; size?: number }> = []
): ValidationResult {
  if (!guideline || !application) {
    return { valid: false, error: 'Guideline and Application files are required.', status: 400 };
  }

  const allFiles = [guideline, application, ...supporting];
  for (const f of allFiles) {
    if (!f || f.type !== 'application/pdf') {
      return { valid: false, error: `File "${f?.name || 'unknown'}" is not a valid PDF.`, status: 400 };
    }
    if (typeof f.size === 'number' && f.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File "${f.name}" exceeds the maximum allowed size of 25MB.`, status: 400 };
    }
  }

  return { valid: true };
}

export interface ParsedRequirement {
  text?: string;
  category?: string;
  importance?: string;
  status?: string;
  explanation?: string;
  missing_evidence?: string | null;
  confidence?: string;
  evidence_quote?: string | null;
  evidence_page?: number;
}

export interface ParsedUnsupportedClaim {
  claim?: string;
  quote?: string;
  explanation?: string;
}

export interface ParsedAiResult {
  completion_percentage: number;
  requirements: ParsedRequirement[];
  clarification_questions: (string | Record<string, unknown>)[];
  unsupported_claims: ParsedUnsupportedClaim[];
  isFallback: boolean;
}

export function parseAiResultWithFallback(rawJsonText: string | null | undefined): ParsedAiResult {
  const fallback: ParsedAiResult = {
    completion_percentage: 0,
    requirements: [],
    clarification_questions: [],
    unsupported_claims: [],
    isFallback: true
  };

  if (!rawJsonText || typeof rawJsonText !== 'string' || !rawJsonText.trim()) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(rawJsonText);
    return {
      completion_percentage: typeof parsed.completion_percentage === 'number' ? parsed.completion_percentage : 0,
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
      clarification_questions: Array.isArray(parsed.clarification_questions) ? parsed.clarification_questions : [],
      unsupported_claims: Array.isArray(parsed.unsupported_claims) ? parsed.unsupported_claims : [],
      isFallback: false
    };
  } catch {
    return fallback;
  }
}
