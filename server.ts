import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const SHARES_FILE = path.join(DATA_DIR, 'shares.json');

const PUBLIC_DIR = path.resolve(__dirname, 'public');
const PUBLIC_UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
const PUBLIC_SHARES_DIR = path.join(PUBLIC_DIR, 'shares');

// Ensure persistent and public static directories exist
for (const dir of [DATA_DIR, UPLOADS_DIR, PUBLIC_DIR, PUBLIC_UPLOADS_DIR, PUBLIC_SHARES_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

interface StoredShareRecord {
  id: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

function readSharesStore(): Record<string, StoredShareRecord> {
  try {
    if (!fs.existsSync(SHARES_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(SHARES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeSharesStore(
  store: Record<string, StoredShareRecord>,
  savedRecord?: StoredShareRecord
): void {
  fs.writeFileSync(SHARES_FILE, JSON.stringify(store, null, 2), 'utf-8');
  if (savedRecord) {
    const shareFilePath = path.join(PUBLIC_SHARES_DIR, `${savedRecord.id}.json`);
    const serialized = JSON.stringify(savedRecord, null, 2);
    fs.writeFileSync(shareFilePath, serialized, 'utf-8');
  }
}

function generateUniqueShortId(existingStore: Record<string, StoredShareRecord>): string {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz';
  for (let attempt = 0; attempt < 20; attempt++) {
    let candidate = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      candidate += alphabet[bytes[i] % alphabet.length];
    }
    if (!existingStore[candidate]) {
      return candidate;
    }
  }
  return Date.now().toString(36).slice(-6);
}

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
};

const EXT_TO_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
};

/**
 * Saves a base64 data URL (image or audio) to both public/uploads/ and data/uploads/
 * and returns its compact public URL path (/uploads/<filename>).
 */
function persistDataUrlToUploadFile(dataUrl: string, prefix = 'media'): string | null {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return null;
  }

  const match = dataUrl.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  const mimeType = match[1].toLowerCase();
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 12);
  const ext = MIME_TO_EXT[mimeType] || 'bin';
  const filename = `${prefix}-${hash}.${ext}`;

  const dataFilePath = path.join(UPLOADS_DIR, filename);
  const publicFilePath = path.join(PUBLIC_UPLOADS_DIR, filename);

  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, buffer);
  }
  if (!fs.existsSync(publicFilePath)) {
    fs.writeFileSync(publicFilePath, buffer);
  }

  return `/uploads/${filename}`;
}

/**
 * Walks a BirthdayConfig object and converts any base64-encoded uploaded photos or audio
 * into stored files under /uploads/:filename so the config remains lightweight and fast.
 */
function extractAndPersistEmbeddedMedia(
  rawConfig: Record<string, unknown>
): Record<string, unknown> {
  const cloned = JSON.parse(JSON.stringify(rawConfig)) as Record<string, unknown>;

  if (Array.isArray(cloned.memories)) {
    cloned.memories = cloned.memories.map((mem: Record<string, unknown>, idx: number) => {
      if (mem && typeof mem.imageUrl === 'string') {
        if (mem.imageUrl.startsWith('data:') && mem.imageUrl.includes(';base64,')) {
          // Persist backup file to /uploads/ while preserving the self-contained compressed data URL
          persistDataUrlToUploadFile(mem.imageUrl, `photo-${idx + 1}`);
          return mem;
        } else if (mem.imageUrl.startsWith('/api/uploads/')) {
          return {
            ...mem,
            imageUrl: mem.imageUrl.replace('/api/uploads/', '/uploads/'),
          };
        }
      }
      return mem;
    });
  }

  if (
    cloned.music &&
    typeof cloned.music === 'object' &&
    cloned.music !== null
  ) {
    const musicObj = cloned.music as Record<string, unknown>;
    if (
      typeof musicObj.customAudioDataUrl === 'string' &&
      musicObj.customAudioDataUrl.startsWith('data:') &&
      musicObj.customAudioDataUrl.includes(';base64,')
    ) {
      const storedAudioUrl = persistDataUrlToUploadFile(
        musicObj.customAudioDataUrl,
        'audio'
      );
      if (storedAudioUrl) {
        cloned.music = {
          ...musicObj,
          customAudioDataUrl: storedAudioUrl,
        };
      }
    }
  }

  return cloned;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support multi-photo and audio uploads in JSON requests up to 30MB
  app.use(express.json({ limit: '30mb' }));

  // 1. Upload a single photo or audio file (returns compact URL /uploads/:filename)
  app.post('/api/uploads', (req, res) => {
    try {
      const { dataUrl, prefix } = req.body || {};
      if (!dataUrl || typeof dataUrl !== 'string') {
        res.status(400).json({ error: 'Missing dataUrl in upload request.' });
        return;
      }

      const safePrefix =
        typeof prefix === 'string' && /^[a-zA-Z0-9_-]{1,24}$/.test(prefix)
          ? prefix
          : 'photo';

      const storedUrl = persistDataUrlToUploadFile(dataUrl, safePrefix);
      if (!storedUrl) {
        res.status(400).json({ error: 'Invalid base64 data URL format.' });
        return;
      }

      res.status(201).json({ url: storedUrl });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Failed to store uploaded media file.' });
    }
  });

  // 2. Serve stored uploaded photos and audio files at both /uploads/:filename and /api/uploads/:filename
  const serveUploadFile = (req: express.Request, res: express.Response) => {
    const rawFilename = req.params.filename || '';
    const safeFilename = path.basename(rawFilename);
    if (!/^[a-zA-Z0-9._-]+$/.test(safeFilename)) {
      res.status(400).json({ error: 'Invalid filename.' });
      return;
    }

    const publicFilePath = path.join(PUBLIC_UPLOADS_DIR, safeFilename);
    const dataFilePath = path.join(UPLOADS_DIR, safeFilename);
    const resolvedPath = fs.existsSync(publicFilePath)
      ? publicFilePath
      : fs.existsSync(dataFilePath)
        ? dataFilePath
        : null;

    if (!resolvedPath) {
      res.status(404).json({ error: 'Uploaded file not found.' });
      return;
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const contentType = EXT_TO_MIME[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    fs.createReadStream(resolvedPath).pipe(res);
  };

  app.get('/api/uploads/:filename', serveUploadFile);
  app.get('/uploads/:filename', serveUploadFile);

  // 3. Create or update a shared birthday configuration with a short ID (Persisted to Supabase + Local Store)
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

  const upsertSupabaseRecord = async (
    shortId: string,
    cfg: Record<string, unknown>
  ): Promise<boolean> => {
    try {
      const payload = {
        id: shortId,
        recipient_name:
          typeof cfg.recipientName === 'string' && cfg.recipientName
            ? cfg.recipientName
            : 'Birthday Star',
        nickname: typeof cfg.nickname === 'string' ? cfg.nickname : '',
        age: typeof cfg.age === 'number' && Number.isFinite(cfg.age) ? cfg.age : 20,
        birthday_date:
          typeof cfg.birthdayDate === 'string' ? cfg.birthdayDate : '',
        sender_name:
          typeof cfg.senderName === 'string' && cfg.senderName
            ? cfg.senderName
            : 'Your Besties',
        relationship:
          typeof cfg.relationship === 'string' ? cfg.relationship : 'Best Friend',
        headline:
          typeof cfg.headline === 'string' ? cfg.headline : 'Happy Birthday! 🎂✨',
        personal_message:
          typeof cfg.personalMessage === 'string' ? cfg.personalMessage : '',
        letter_greeting:
          typeof cfg.letterGreeting === 'string' ? cfg.letterGreeting : '',
        letter_body: typeof cfg.letterBody === 'string' ? cfg.letterBody : '',
        letter_sign_off:
          typeof cfg.letterSignOff === 'string' ? cfg.letterSignOff : '',
        final_headline:
          typeof cfg.finalHeadline === 'string' ? cfg.finalHeadline : '',
        final_subtext:
          typeof cfg.finalSubtext === 'string' ? cfg.finalSubtext : '',
        memories: Array.isArray(cfg.memories) ? cfg.memories : [],
        wishes: Array.isArray(cfg.wishes) ? cfg.wishes : [],
        funny_moments: Array.isArray(cfg.funnyMoments) ? cfg.funnyMoments : [],
        gadget_surprises: Array.isArray(cfg.gadgetSurprises)
          ? cfg.gadgetSurprises
          : [],
        music: cfg.music && typeof cfg.music === 'object' ? cfg.music : {},
        appearance:
          cfg.appearance && typeof cfg.appearance === 'object'
            ? cfg.appearance
            : {},
        sections:
          cfg.sections && typeof cfg.sections === 'object' ? cfg.sections : {},
        config: cfg,
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
  };

  const fetchSupabaseRecord = async (
    shortId: string
  ): Promise<StoredShareRecord | null> => {
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
      const rows = (await res.json()) as Array<Record<string, unknown>>;
      if (!Array.isArray(rows) || rows.length === 0) return null;
      const row = rows[0];
      const baseConfig =
        row.config && typeof row.config === 'object'
          ? (row.config as Record<string, unknown>)
          : {};
      const mergedConfig: Record<string, unknown> = {
        ...baseConfig,
        recipientName:
          typeof row.recipient_name === 'string' && row.recipient_name
            ? row.recipient_name
            : baseConfig.recipientName,
        nickname:
          typeof row.nickname === 'string' ? row.nickname : baseConfig.nickname,
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
        id: String(row.id || shortId),
        config: mergedConfig,
        createdAt: String(row.created_at || new Date().toISOString()),
        updatedAt: String(row.updated_at || new Date().toISOString()),
      };
    } catch {
      return null;
    }
  };

  app.post('/api/shares', async (req, res) => {
    try {
      const { id: requestedId, config } = req.body || {};
      if (!config || typeof config !== 'object' || typeof config.recipientName !== 'string') {
        res.status(400).json({
          error: 'Valid birthday configuration with recipientName is required.',
        });
        return;
      }

      const store = readSharesStore();
      // Honor the client's existing short ID if valid so links never become orphaned
      const validRequestedId =
        typeof requestedId === 'string' &&
        /^[a-zA-Z0-9_-]{2,48}$/.test(requestedId)
          ? requestedId
          : null;

      const shortId = validRequestedId || generateUniqueShortId(store);
      const cleanedConfig = extractAndPersistEmbeddedMedia(
        config as Record<string, unknown>
      );
      const nowIso = new Date().toISOString();

      const record: StoredShareRecord = {
        id: shortId,
        config: cleanedConfig,
        createdAt: store[shortId]?.createdAt || nowIso,
        updatedAt: nowIso,
      };

      store[shortId] = record;
      writeSharesStore(store, record);

      const savedToSupabase = await upsertSupabaseRecord(shortId, cleanedConfig);

      res.status(201).json({
        id: shortId,
        sharePath: `/${shortId}`,
        config: cleanedConfig,
        savedToSupabase,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });
    } catch (err) {
      console.error('Error saving share config:', err);
      res.status(500).json({
        error: 'Failed to save shared birthday configuration on server.',
      });
    }
  });

  // 4. Retrieve a shared birthday configuration by its short ID
  const handleGetShare = async (rawIdInput: string, res: express.Response) => {
    try {
      const rawId = (rawIdInput || '').trim();
      if (!/^[a-zA-Z0-9_-]{2,48}$/.test(rawId)) {
        res.status(400).json({ error: 'Invalid share ID format.' });
        return;
      }

      // 1. Check Supabase database first for latest synced record
      let record: StoredShareRecord | undefined | null =
        await fetchSupabaseRecord(rawId);

      // 2. Fallback to local file store
      if (!record) {
        const store = readSharesStore();
        record = store[rawId];
      }

      // 3. Also check static public/shares/<id>.json for this specific share ID
      if (!record) {
        const publicSharePath = path.join(PUBLIC_SHARES_DIR, `${rawId}.json`);
        if (fs.existsSync(publicSharePath)) {
          record = JSON.parse(fs.readFileSync(publicSharePath, 'utf-8'));
        }
      }

      if (!record) {
        res.status(404).json({
          error: `Birthday surprise "${rawId}" was not found. Please check the link or create a new share link.`,
        });
        return;
      }

      res.json(record);
    } catch (err) {
      console.error('Error loading share config:', err);
      res.status(500).json({
        error: 'Failed to load shared birthday configuration.',
      });
    }
  };

  app.get('/api/shares', (req, res) => {
    const queryId = typeof req.query.id === 'string' ? req.query.id : '';
    void handleGetShare(queryId, res);
  });

  app.get('/api/shares/:id', (req, res) => {
    void handleGetShare(req.params.id || '', res);
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(PUBLIC_DIR));
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DoraPocket Birthday Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
