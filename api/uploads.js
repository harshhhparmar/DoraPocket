export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { dataUrl } = req.body || {};
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Missing dataUrl in upload request.' });
    }
    return res.status(201).json({ url: dataUrl });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
