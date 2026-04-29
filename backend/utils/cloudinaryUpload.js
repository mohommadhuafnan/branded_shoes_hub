const crypto = require('crypto');

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

async function uploadBufferToCloudinary(fileBuffer, mimeType) {
  if (!hasCloudinaryConfig()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'products';
  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign = [`folder=${folder}`, `timestamp=${timestamp}`].join('&');
  const signature = crypto.createHash('sha1').update(`${paramsToSign}${apiSecret}`).digest('hex');

  const fileDataUrl = `data:${mimeType || 'image/jpeg'};base64,${fileBuffer.toString('base64')}`;
  const form = new FormData();
  form.append('file', fileDataUrl);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;
  const response = await fetch(endpoint, { method: 'POST', body: form });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.secure_url) {
    const msg =
      payload?.error?.message ||
      payload?.message ||
      `Cloudinary upload failed with status ${response.status}.`;
    throw new Error(msg);
  }

  return payload.secure_url;
}

module.exports = {
  hasCloudinaryConfig,
  uploadBufferToCloudinary
};
