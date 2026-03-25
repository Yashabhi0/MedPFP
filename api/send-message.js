import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ success: false, error: 'phone and message are required' });
  }

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    return res.status(500).json({ success: false, error: 'Twilio credentials not configured' });
  }

  const client = twilio(sid, token);
  const to = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;

  try {
    const result = await client.messages.create({
      from: 'whatsapp:+14155238886',
      to,
      body: message,
    });
    return res.status(200).json({ success: true, sid: result.sid });
  } catch (err) {
    console.error('[send-message] Twilio error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
