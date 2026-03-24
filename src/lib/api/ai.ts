const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

export type Medicine = {
  name: string;
  dosage: string;
  frequency: string;
};

export type MedicalData = {
  conditions: string[];
  allergies: string[];
  medicines: Medicine[];
};

const FALLBACK: MedicalData = { conditions: [], allergies: [], medicines: [] };

export async function parseMedicalText(text: string): Promise<MedicalData> {
  const prompt = `You are a medical data parser.
Extract structured medical information from the text below.
Return ONLY valid JSON. Do not include explanations, markdown, or extra text.
Format:
{ "conditions": ["string"], "allergies": ["string"], "medicines": [ { "name": "string", "dosage": "string", "frequency": "string" } ] }
If something is missing, return empty arrays.
Text: ${text}`;

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    const raw: string = data.candidates[0].content.parts[0].text;

    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      return {
        conditions: parsed.conditions ?? [],
        allergies: parsed.allergies ?? [],
        medicines: parsed.medicines ?? [],
      };
    } catch (err) {
      console.error('JSON parse failed', err);
      return FALLBACK;
    }
  } catch (error) {
    console.error('AI parsing failed', error);
    return FALLBACK;
  }
}
