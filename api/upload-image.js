import { requireAdmin } from '../lib/authServer.js';
import { getJsonBody } from '../lib/httpBody.js';

const MAX_CHARS = 2_600_000;

/**
 * Stores product images without Firebase: accepts a data URL from the admin UI.
 * Keeps images in Postgres as data URLs (fine for small files; use an external URL for huge assets).
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!requireAdmin(req)) {
    return res.status(401).json({ message: 'Admin permission required.' });
  }

  try {
    const body = await getJsonBody(req);
    const dataUrl = String(body.dataUrl || '');
    if (!dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Expected a data:image/...;base64,... URL' });
    }
    if (dataUrl.length > MAX_CHARS) {
      return res.status(400).json({ message: 'Image too large. Compress the file or paste an HTTPS image URL instead.' });
    }

    return res.status(200).json({ url: dataUrl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Server error' });
  }
}
