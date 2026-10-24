import fs from 'fs';
import path from 'path';

const TMP_SHARES_FILE = path.join('/tmp', 'dorapocket_shares.json');

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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export default function handler(req, res) {
  const store = readTmpStore();

  if (req.method === 'POST') {
    const { id: requestedId, config: birthdayConfig } = req.body || {};
    if (!birthdayConfig || typeof birthdayConfig !== 'object') {
      return res.status(400).json({ error: 'Valid birthday config required.' });
    }
    const shortId =
      typeof requestedId === 'string' && /^[a-zA-Z0-9_-]{4,24}$/.test(requestedId)
        ? requestedId
        : `dora${Math.random().toString(36).slice(2, 8)}`;

    const nowIso = new Date().toISOString();
    const record = {
      id: shortId,
      config: birthdayConfig,
      createdAt: store[shortId]?.createdAt || nowIso,
      updatedAt: nowIso,
    };
    store[shortId] = record;
    writeTmpStore(store);

    return res.status(201).json({
      id: shortId,
      sharePath: `/?s=${shortId}`,
      config: birthdayConfig,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  if (req.method === 'GET') {
    const rawId = String(req.query?.id || '').trim();
    if (!rawId || !store[rawId]) {
      return res.status(404).json({ error: 'Share not found.' });
    }
    return res.status(200).json(store[rawId]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
