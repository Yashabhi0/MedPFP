const CONDITION_MAP = {
  'BP':            'cardiologist',
  'Heart Disease': 'cardiologist',
  'Diabetes':      'diabetologist',
  'Asthma':        'pulmonologist',
  'Hypertension':  'cardiologist',
  'Thyroid':       'endocrinologist',
  'Arthritis':     'rheumatologist',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { lat, lng, condition } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, error: 'lat and lng are required' });
  }

  const specialty = condition ? (CONDITION_MAP[condition] ?? 'doctor') : 'doctor';

  const overpassQuery = `
[out:json][timeout:25];
(
  node["amenity"="doctors"](around:5000,${lat},${lng});
  way["amenity"="doctors"](around:5000,${lat},${lng});
  relation["amenity"="doctors"](around:5000,${lat},${lng});
  node["healthcare"="doctor"](around:5000,${lat},${lng});
  way["healthcare"="doctor"](around:5000,${lat},${lng});
);
out center;
  `.trim();

  try {
    const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!overpassRes.ok) throw new Error(`Overpass API returned ${overpassRes.status}`);

    const data = await overpassRes.json();

    const doctors = (data.elements ?? [])
      .map((el) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLng = el.lon  ?? el.center?.lon;
        if (!elLat || !elLng) return null;
        const tags = el.tags ?? {};
        return {
          name:      tags.name || tags['name:en'] || 'Unnamed Clinic',
          lat:       elLat,
          lng:       elLng,
          specialty: tags['healthcare:speciality'] ?? tags.specialty ?? specialty,
          phone:     tags.phone ?? tags['contact:phone'] ?? null,
          address:   tags['addr:full'] ?? tags['addr:street'] ?? null,
          opening:   tags.opening_hours ?? null,
        };
      })
      .filter(Boolean);

    return res.status(200).json({ success: true, specialty, doctors });
  } catch (err) {
    console.error('[nearby-doctors] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
