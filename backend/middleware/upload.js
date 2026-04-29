const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/** Extensions browsers use for photos / web images (fallback when mimetype is wrong or empty). */
const ALLOWED_IMAGE_EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.svg',
  '.avif',
  '.heic',
  '.heif',
  '.tif',
  '.tiff'
]);

function extFromMime(mime) {
  const m = (mime || '').toLowerCase();
  if (m.includes('jpeg') || m === 'image/jpg') return '.jpg';
  if (m.includes('png')) return '.png';
  if (m.includes('gif')) return '.gif';
  if (m.includes('webp')) return '.webp';
  if (m.includes('bmp')) return '.bmp';
  if (m.includes('svg')) return '.svg';
  if (m.includes('avif')) return '.avif';
  if (m.includes('heic')) return '.heic';
  if (m.includes('heif')) return '.heif';
  if (m.includes('tiff')) return '.tiff';
  return '';
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname || '').toLowerCase();
    if (ext === '.jpe') ext = '.jpg';
    if (!ext || ext === '.') {
      ext = extFromMime(file.mimetype) || '.jpg';
    }
    if (!ALLOWED_IMAGE_EXT.has(ext)) {
      const fromMime = extFromMime(file.mimetype);
      ext = fromMime || '.jpg';
    }
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();
  const normalizedExt = ext === '.jpe' ? '.jpg' : ext;

  if (mime.startsWith('image/')) {
    return cb(null, true);
  }
  if (normalizedExt && ALLOWED_IMAGE_EXT.has(normalizedExt)) {
    return cb(null, true);
  }
  cb(
    new Error(
      'Only image files are allowed (JPG, JPEG, PNG, GIF, WebP, BMP, SVG, AVIF, HEIC, TIFF).'
    )
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }
});

module.exports = upload;
