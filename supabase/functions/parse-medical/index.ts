// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FALLBACK = { conditions: [], allergies: [], medicines: [] };

const PROMPT = `You are a medical data parser.
Analyze the provided medical document (PDF or image).
Extract the following:
- conditions (list of diseases)
- allergies (list)
- medicines: name, dosage, frequency

Return ONLY valid JSON in this exact format, no markdown, no explanation:
{"conditions":[],"allergies":[],"medicines":[{"name":"","dosage":"","frequency":""}]}
If something is missing, use empty arrays.`;

/** Safe base64 encoder that handles large files without stack overflow */
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  console.log('[parse-medical] Function triggered');

  try {
    let body: { fileUrl?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const { fileUrl } = body;
    console.log('[parse-medical] Received fileUrl:', fileUrl);

    if (!fileUrl) {
      return new Response(JSON.stringify({ error: 'fileUrl is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('[parse-medical] GEMINI_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: missing API key' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the file from Supabase Storage
    console.log('[parse-medical] Fetching file from URL...');
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      console.error('[parse-medical] File fetch failed:', fileRes.status, fileRes.statusText);
      return new Response(JSON.stringify({ error: `Failed to fetch file: ${fileRes.status}` }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    console.log('[parse-medical] File fetched successfully');

    const arrayBuffer = await fileRes.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const base64 = toBase64(bytes);
    console.log('[parse-medical] File converted to base64, size:', bytes.length, 'bytes');

    // Detect MIME type
    const contentType = fileRes.headers.get('content-type') ?? '';
    let mimeType = 'application/pdf';
    if (contentType.includes('image/png') || fileUrl.match(/\.png(\?|$)/i)) {
      mimeType = 'image/png';
    } else if (contentType.includes('image/jpeg') || fileUrl.match(/\.(jpg|jpeg)(\?|$)/i)) {
      mimeType = 'image/jpeg';
    }
    console.log('[parse-medical] Detected MIME type:', mimeType);

    // Call Gemini 1.5 Flash
    console.log('[parse-medical] Calling Gemini API...');
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: PROMPT },
              { inlineData: { mimeType, data: base64 } },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[parse-medical] Gemini API error:', geminiRes.status, errText);
      return new Response(JSON.stringify({ error: `Gemini error: ${geminiRes.status}`, details: errText }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiRes.json();
    console.log('[parse-medical] Gemini response received');

    const raw: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    console.log('[parse-medical] Raw Gemini text:', raw.slice(0, 300));

    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[parse-medical] JSON parse failed. Raw output:', cleaned.slice(0, 500));
      // Return fallback instead of error — document may just have no medical data
      return new Response(JSON.stringify(FALLBACK), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const result = {
      conditions: Array.isArray(parsed.conditions) ? parsed.conditions : [],
      allergies: Array.isArray(parsed.allergies) ? parsed.allergies : [],
      medicines: Array.isArray(parsed.medicines) ? parsed.medicines : [],
    };

    console.log('[parse-medical] Returning result:', JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[parse-medical] Unhandled error:', error?.message ?? error);
    return new Response(
      JSON.stringify({ error: error?.message ?? 'Unknown error' }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
});
