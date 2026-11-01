import fs from 'fs';
import path from 'path';

const TMP_SHARES_FILE = path.join('/tmp', 'dorapocket_shares.json');

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://bwmsywizdfjakoghyjma.supabase.co';

const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_1zYEH-f8ipMmxpStFtm8UQ_-gsdwSfb';

const SUPABASE_REST_ENDPOINT = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/birthday_websites`;

function readTmpStore() {
  try {
    if (fs.existsSync(TMP_SHARES_FILE)) {
      const raw = fs.readFileSync(TMP_SHARES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // Ignore read error
  }
  return {};
}

function writeTmpStore(store) {
  try {
    fs.writeFileSync(TMP_SHARES_FILE, JSON.stringify(store), 'utf-8');
  } catch {
    // Ignore write error
  }
}

async function upsertSupabaseWebsite(shortId, birthdayConfig) {
  try {
    const payload = {
      id: shortId,
      recipient_name: birthdayConfig.recipientName || 'Birthday Star',
      nickname: birthdayConfig.nickname || '',
      age: Number.isFinite(birthdayConfig.age) ? birthdayConfig.age : 20,
      birthday_date: birthdayConfig.birthdayDate || '',
      sender_name: birthdayConfig.senderName || 'Your Besties',
      relationship: birthdayConfig.relationship || 'Best Friend',
      headline: birthdayConfig.headline || 'Happy Birthday! 🎂✨',
      personal_message: birthdayConfig.personalMessage || '',
      letter_greeting: birthdayConfig.letterGreeting || '',
      letter_body: birthdayConfig.letterBody || '',
      letter_sign_off: birthdayConfig.letterSignOff || '',
      final_headline: birthdayConfig.finalHeadline || '',
      final_subtext: birthdayConfig.finalSubtext || '',
      memories: Array.isArray(birthdayConfig.memories) ? birthdayConfig.memories : [],
      wishes: Array.isArray(birthdayConfig.wishes) ? birthdayConfig.wishes : [],
      funny_moments: Array.isArray(birthdayConfig.funnyMoments)
        ? birthdayConfig.funnyMoments
        : [],
      gadget_surprises: Array.isArray(birthdayConfig.gadgetSurprises)
        ? birthdayConfig.gadgetSurprises
        : [],
      music: birthdayConfig.music || {},
      appearance: birthdayConfig.appearance || {},
      sections: birthdayConfig.sections || {},
      config: birthdayConfig,
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(`${SUPABASE_REST_ENDPOINT}?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch {
    return false;
  }
}

async function fetchSupabaseWebsite(shortId) {
  try {
    const url = `${SUPABASE_REST_ENDPOINT}?id=eq.${encodeURIComponent(shortId)}&select=*&limit=1`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const row = rows[0];
    const baseConfig = row.config && typeof row.config === 'object' ? row.config : {};
    const mergedConfig = {
      ...baseConfig,
      recipientName: row.recipient_name || baseConfig.recipientName || 'Birthday Star',
      nickname: typeof row.nickname === 'string' ? row.nickname : baseConfig.nickname,
      age: typeof row.age === 'number' ? row.age : baseConfig.age,
      birthdayDate: row.birthday_date || baseConfig.birthdayDate,
      senderName: row.sender_name || baseConfig.senderName,
      relationship: row.relationship || baseConfig.relationship,
      headline: row.headline || baseConfig.headline,
      personalMessage: row.personal_message || baseConfig.personalMessage,
      letterGreeting: row.letter_greeting || baseConfig.letterGreeting,
      letterBody: row.letter_body || baseConfig.letterBody,
      letterSignOff: row.letter_sign_off || baseConfig.letterSignOff,
      finalHeadline: row.final_headline || baseConfig.finalHeadline,
      finalSubtext: row.final_subtext || baseConfig.finalSubtext,
      memories:
        Array.isArray(row.memories) && row.memories.length > 0
          ? row.memories
          : baseConfig.memories,
      wishes:
        Array.isArray(row.wishes) && row.wishes.length > 0
          ? row.wishes
          : baseConfig.wishes,
      funnyMoments:
        Array.isArray(row.funny_moments) && row.funny_moments.length > 0
          ? row.funny_moments
          : baseConfig.funnyMoments,
      gadgetSurprises:
        Array.isArray(row.gadget_surprises) && row.gadget_surprises.length > 0
          ? row.gadget_surprises
          : baseConfig.gadgetSurprises,
      music: row.music || baseConfig.music,
      appearance: row.appearance || baseConfig.appearance,
      sections: row.sections || baseConfig.sections,
    };

    return {
      id: row.id || shortId,
      config: mergedConfig,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export default async function handler(req, res) {
  const store = readTmpStore();

  if (req.method === 'POST') {
    const { id: requestedId, config: birthdayConfig } = req.body || {};
    if (!birthdayConfig || typeof birthdayConfig !== 'object') {
      return res.status(400).json({ error: 'Valid birthday config required.' });
    }
    const shortId =
      typeof requestedId === 'string' && /^[a-zA-Z0-9_-]{2,48}$/.test(requestedId)
        ? requestedId
        : 'birthday';

    const nowIso = new Date().toISOString();
    const record = {
      id: shortId,
      config: birthdayConfig,
      createdAt: store[shortId]?.createdAt || nowIso,
      updatedAt: nowIso,
    };
    store[shortId] = record;
    writeTmpStore(store);

    const savedToSupabase = await upsertSupabaseWebsite(shortId, birthdayConfig);

    return res.status(201).json({
      id: shortId,
      sharePath: `/${shortId}`,
      config: birthdayConfig,
      savedToSupabase,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  if (req.method === 'GET') {
    const rawId = String(req.query?.id || '').trim();
    if (!rawId) {
      return res.status(400).json({ error: 'Missing share id.' });
    }

    // 1. Query Supabase database first so Vercel serverless shares work across all instances & devices
    const supabaseRecord = await fetchSupabaseWebsite(rawId);
    if (supabaseRecord) {
      return res.status(200).json(supabaseRecord);
    }

    // 2. Fallback to local /tmp cache
    if (store[rawId]) {
      return res.status(200).json(store[rawId]);
    }

    return res.status(404).json({ error: 'Share not found.' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
