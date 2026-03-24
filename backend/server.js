const express = require('express');
const cors    = require('cors');
const twilio  = require('twilio');
const cron    = require('node-cron');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const FROM = 'whatsapp:+14155238886';

// In-memory store for scheduled jobs  { id -> cron.ScheduledTask }
const jobs = {};

function getTwilioClient() {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error('Twilio credentials not set in .env');
  return twilio(sid, token);
}

async function sendWhatsApp(phone, message) {
  const client = getTwilioClient();
  const to = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
  const result = await client.messages.create({ from: FROM, to, body: message });
  console.log('[whatsapp] Sent SID:', result.sid);
  return result.sid;
}

// POST /api/send-message
// body: { phone, message, timeMode, scheduleTime, dayMode, customDate }
app.post('/api/send-message', async (req, res) => {
  const { phone, message, timeMode, scheduleTime, dayMode, customDate } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ success: false, error: 'phone and message are required' });
  }

  try {
    // ── Send Now ──────────────────────────────────────────────────────────
    if (timeMode === 'now') {
      const sid = await sendWhatsApp(phone, message);
      return res.json({ success: true, mode: 'sent_now', sid });
    }

    // ── Scheduled ─────────────────────────────────────────────────────────
    if (!scheduleTime) {
      return res.status(400).json({ success: false, error: 'scheduleTime is required for scheduled mode' });
    }

    const [hour, minute] = scheduleTime.split(':').map(Number);

    // Cancel any existing job for this phone
    if (jobs[phone]) {
      jobs[phone].stop();
      delete jobs[phone];
    }

    if (dayMode === 'everyday') {
      // Run every day at the given time
      const expr = `${minute} ${hour} * * *`;
      jobs[phone] = cron.schedule(expr, async () => {
        try { await sendWhatsApp(phone, message); }
        catch (e) { console.error('[cron] Error:', e.message); }
      }, { timezone: 'Asia/Kolkata' });

      console.log(`[schedule] Everyday at ${scheduleTime} for ${phone}`);
      return res.json({ success: true, mode: 'scheduled_everyday', scheduleTime });
    }

    if (dayMode === 'custom') {
      if (!customDate) {
        return res.status(400).json({ success: false, error: 'customDate is required for custom day mode' });
      }

      const [year, month, day] = customDate.split('-').map(Number);
      const expr = `${minute} ${hour} ${day} ${month} *`;

      jobs[phone] = cron.schedule(expr, async () => {
        try {
          await sendWhatsApp(phone, message);
          // One-time — stop after firing
          jobs[phone]?.stop();
          delete jobs[phone];
        } catch (e) { console.error('[cron] Error:', e.message); }
      }, { timezone: 'Asia/Kolkata' });

      console.log(`[schedule] Once on ${customDate} at ${scheduleTime} for ${phone}`);
      return res.json({ success: true, mode: 'scheduled_custom', scheduleTime, customDate });
    }

    // dayMode === 'none' with scheduleTime — send once at that time today
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);

    if (target <= now) {
      return res.status(400).json({ success: false, error: 'Scheduled time is in the past' });
    }

    const delay = target - now;
    setTimeout(async () => {
      try { await sendWhatsApp(phone, message); }
      catch (e) { console.error('[timeout] Error:', e.message); }
    }, delay);

    console.log(`[schedule] Once today at ${scheduleTime} (in ${Math.round(delay / 60000)} min) for ${phone}`);
    return res.json({ success: true, mode: 'scheduled_once_today', scheduleTime });

  } catch (err) {
    console.error('[send-message] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/cancel-reminder/:phone  — cancel a scheduled job
app.delete('/api/cancel-reminder/:phone', (req, res) => {
  const phone = decodeURIComponent(req.params.phone);
  if (jobs[phone]) {
    jobs[phone].stop();
    delete jobs[phone];
    return res.json({ success: true, message: 'Reminder cancelled' });
  }
  res.status(404).json({ success: false, error: 'No active reminder for this phone' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
