import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedDocument } from '@/types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const EXTRACTION_PROMPT = `You are a medical document parser. Extract information from this prescription or lab report and return ONLY valid JSON with no markdown, no explanation, no code blocks. Use exactly this structure:
{"medicines": [{"name": "string", "dosage": "string", "frequency": "string"}],"conditions": ["string"],"labValues": [{"name": "string", "value": "string", "unit": "string", "date": "string"}],"doctorName": "string or null","clinicName": "string or null"}
If a field is unclear or absent, use null for strings and empty arrays for arrays. Do not invent data.`;

export async function parseDocument(file: File): Promise<ParsedDocument> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const arrayBuffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  const mimeType = file.type as 'image/jpeg' | 'image/png' | 'application/pdf';

  const result = await model.generateContent([
    EXTRACTION_PROMPT,
    { inlineData: { data: base64, mimeType } },
  ]);

  const text = result.response.text().trim();

  try {
    const parsed = JSON.parse(text);
    return {
      medicines: parsed.medicines ?? [],
      conditions: parsed.conditions ?? [],
      labValues: parsed.labValues ?? [],
      doctorName: parsed.doctorName ?? null,
      clinicName: parsed.clinicName ?? null,
    };
  } catch {
    throw new Error('AI returned invalid JSON. Raw: ' + text.slice(0, 200));
  }
}
