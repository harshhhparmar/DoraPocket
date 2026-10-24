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
    let suffix = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      suffix += alphabet[bytes[i] % alphabet.length];
    }
    const candidate = `dora${suffix}`;
    if (!existingStore[candidate]) {
      return candidate;
    }
  }
  return `dora${Date.now().toString(36)}`;
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
          const storedUrl = persistDataUrlToUploadFile(mem.imageUrl, `photo-${idx + 1}`);
          if (storedUrl) {
            return {
              ...mem,
              imageUrl: storedUrl,
            };
          }
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

  // 3. Create or update a shared birthday configuration with a short ID
  app.post('/api/shares', (req, res) => {
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
        /^[a-zA-Z0-9_-]{4,24}$/.test(requestedId)
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

      res.status(201).json({
        id: shortId,
        sharePath: `/?s=${shortId}`,
        config: cleanedConfig,
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
  const handleGetShare = (rawIdInput: string, res: express.Response) => {
    try {
      const rawId = (rawIdInput || '').trim();
      if (!/^[a-zA-Z0-9_-]{3,32}$/.test(rawId)) {
        res.status(400).json({ error: 'Invalid share ID format.' });
        return;
      }

      const store = readSharesStore();
      let record: StoredShareRecord | undefined = store[rawId];

      // Also check static public/shares/<id>.json for this specific share ID
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
    handleGetShare(queryId, res);
  });

  app.get('/api/shares/:id', (req, res) => {
    handleGetShare(req.params.id || '', res);
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
