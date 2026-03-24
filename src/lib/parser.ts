import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedDocument } from '@/types';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Point pdf.js worker to the bundled asset
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

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

async function extractTextFromPdf(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(pageText);
  }

  return pages.join('\n');
}

async function extractTextFromImage(blob: Blob): Promise<string> {
  const worker = await createWorker('eng');
  const { data } = await worker.recognize(blob);
  await worker.terminate();
  return data.text;
}

export async function extractTextFromFile(fileUrl: string): Promise<string> {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();

    if (blob.type === 'application/pdf') {
      return await extractTextFromPdf(blob);
    }

    if (blob.type === 'image/jpeg' || blob.type === 'image/png') {
      return await extractTextFromImage(blob);
    }

    throw new Error(`Unsupported file type: ${blob.type}`);
  } catch (error) {
    console.error('Text extraction failed', error);
    return '';
  }
}
