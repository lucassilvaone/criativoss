// api/uploadFile.js
// Endpoint correto: https://kieai.redpandaai.co/api/file-base64-upload
// Aceita JSON com { base64Data, uploadPath, fileName } — sem multipart

const API_KEY = process.env.KIE_API_KEY || '64496667f7fdcf0d42da56dd49599ec7';
const UPLOAD_URL = 'https://kieai.redpandaai.co/api/file-base64-upload';

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { base64, filename, mimeType } = req.body;
    if (!base64) return res.status(400).json({ error: 'base64 obrigatório' });

    const ext = (mimeType || 'image/jpeg').split('/')[1]?.replace('jpeg','jpg') || 'jpg';
    const fname = filename || `img_${Date.now()}.${ext}`;

    console.log(`[upload] Enviando ${fname} para kie.ai base64 endpoint...`);

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data: base64,   // aceita "data:image/png;base64,..." direto
        uploadPath: 'creatives',
        fileName: fname,
      }),
    });

    const raw = await response.text();
    console.log(`[upload] Status ${response.status}: ${raw.substring(0, 300)}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upload falhou (${response.status}): ${raw}` });
    }

    const data = JSON.parse(raw);
    const url = data?.data?.downloadUrl || data?.data?.fileUrl || data?.downloadUrl || data?.fileUrl;

    if (!url) {
      return res.status(500).json({ error: 'downloadUrl não retornada', raw });
    }

    console.log(`[upload] ✓ ${url}`);
    return res.status(200).json({ success: true, url });

  } catch (err) {
    console.error('[upload] Erro:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
