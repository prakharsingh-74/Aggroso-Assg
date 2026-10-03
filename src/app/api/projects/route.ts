import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@insforge/sdk/ssr';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const insforge = createServerClient({ cookies: cookieStore });
    
    const formData = await req.formData();
    const guideline = formData.get('guideline') as File;
    const application = formData.get('application') as File;
    const supporting = formData.getAll('supporting') as File[];

    if (!guideline || !application) {
      return NextResponse.json({ error: 'Guideline and Application are required' }, { status: 400 });
    }

    const projectName = `Review - ${new Date().toLocaleString()}`;

    const { data: project, error: projectError } = await insforge.database
      .from('projects')
      .insert([{ name: projectName }])
      .select()
      .single();
    if (projectError) throw projectError;

    // We'll save files using their hash as the filename to make retrieval easy and deterministic
    const saveFileWithHash = async (file: File, type: string) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      const objectKey = `${hash}.pdf`;
      
      // Upload to InsForge Storage
      const { error: uploadError } = await insforge.storage.from('documents').upload(objectKey, file);
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Failed to upload file to storage');
      }

      const { data: document, error } = await insforge.database.from('documents').insert([{
        project_id: project.id,
        type,
        filename: file.name,
        file_hash: hash,
      }]).select().single();
      if (error) throw error;
      return document;
    };

    const guidelineDoc = await saveFileWithHash(guideline, 'GUIDELINE');
    const applicationDoc = await saveFileWithHash(application, 'DRAFT_APPLICATION');
    
    for (const doc of supporting) {
      await saveFileWithHash(doc, 'SUPPORTING');
    }

    // --- REAL AI PROCESSING ---
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const guidelineBuffer = Buffer.from(await guideline.arrayBuffer());
      const applicationBuffer = Buffer.from(await application.arrayBuffer());
      
      const prompt = `
        You are an expert grant reviewer. Analyze the Grant Guideline PDF (first inline file) and the Draft Application PDF (second inline file).
        Perform the following workflow:
        1. Extract eligibility and submission requirements from the guideline.
        2. Distinguish mandatory requirements from recommendations.
        3. Map application content to each requirement.
        4. Identify missing, weak, or ambiguous evidence.
        5. Cite the source supporting every mapping with page numbers and exact quotes.
        6. Generate clarification questions.
        7. Identify claims in the application that are not supported by supplied evidence.
        
        Respond ONLY with a JSON object matching this schema (do not wrap in markdown blocks, return raw json):
        {
          "completion_percentage": 50,
          "requirements": [
            {
              "text": "Requirement text",
              "category": "Project Plan",
              "importance": "mandatory",
              "status": "complete",
              "explanation": "Why this status was given",
              "missing_evidence": "What is missing (if applicable)",
              "confidence": "high",
              "evidence_quote": "Exact quote from application (if found, else null)",
              "evidence_page": 1
            }
          ],
          "clarification_questions": ["Question 1", "Question 2"],
          "unsupported_claims": [
            {
              "claim": "Claim text",
              "quote": "Exact quote of claim",
              "explanation": "Why it lacks evidence"
            }
          ]
        }
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
              { role: 'user', parts: [
                  { text: prompt },
                  { inlineData: { mimeType: 'application/pdf', data: guidelineBuffer.toString('base64') } },
                  { inlineData: { mimeType: 'application/pdf', data: applicationBuffer.toString('base64') } }
              ]}
          ],
          config: {
              responseMimeType: "application/json"
          }
      });
      
      const result = JSON.parse(response.text || '{}');

      const { data: assessment } = await insforge.database.from('assessments').insert([{
        project_id: project.id,
        status: 'COMPLETED',
        completion_percentage: result.completion_percentage || 0
      }]).select().single();

      if (assessment) {
        for (const req of result.requirements || []) {
          const { data: dbReq } = await insforge.database.from('requirements').insert([{
            project_id: project.id,
            text: req.text,
            category: req.category || 'General',
            importance: req.importance || 'mandatory',
          }]).select().single();

          if (dbReq) {
            const { data: mapRecord } = await insforge.database.from('evidence_mappings').insert([{
              assessment_id: assessment.id,
              requirement_id: dbReq.id,
              status: req.status || 'missing',
              explanation: req.explanation || '',
              missing_evidence: req.missing_evidence || null,
              confidence: req.confidence || 'medium'
            }]).select().single();

            if (mapRecord && req.evidence_quote) {
              await insforge.database.from('evidences').insert([{
                mapping_id: mapRecord.id,
                document_id: applicationDoc.id,
                page_number: req.evidence_page || 1,
                quote: req.evidence_quote
              }]);
            }
          }
        }
        
        for (const q of result.clarification_questions || []) {
          await insforge.database.from('clarification_questions').insert([{
            assessment_id: assessment.id,
            question: q
          }]);
        }

        for (const claim of result.unsupported_claims || []) {
          await insforge.database.from('unsupported_claims').insert([{
            assessment_id: assessment.id,
            claim: claim.claim,
            document_id: applicationDoc.id,
            page_number: 1,
            quote: claim.quote || claim.claim,
            explanation: claim.explanation,
            supporting_evidence_found: false
          }]);
        }
      }
    } catch (aiError) {
      console.error('AI Error:', aiError);
    }

    return NextResponse.json({ projectId: project.id, success: true });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
