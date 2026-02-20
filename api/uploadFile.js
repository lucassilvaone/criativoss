// api/uploadFile.js — Proxy de upload para kie.ai
// Endpoint correto: https://kieai.redpandaai.co/api/file-stream-upload

const API_KEY = process.env.KIE_API_KEY || '64496667f7fdcf0d42da56dd49599ec7';
const UPLOAD_URL = 'https://kieai.redpandaai.co/api/file-stream-upload';

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

    // Extrai apenas os bytes (remove prefixo data:image/...;base64,)
    const b64Data = base64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(b64Data, 'base64');
    const mime = mimeType || 'image/jpeg';
    const ext = mime.split('/')[1] || 'jpg';
    const fname = filename || `img_${Date.now()}.${ext}`;

    // Monta multipart/form-data manualmente (compatível com Node.js 18 do Vercel)
    const boundary = `----VercelBoundary${Date.now()}${Math.random().toString(36).slice(2)}`;

    const partHeader = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fname}"\r\n` +
      `Content-Type: ${mime}\r\n\r\n`
    );
    const partFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([partHeader, buffer, partFooter]);

    console.log(`[uploadFile] Enviando ${fname} (${buffer.length} bytes) para kie.ai...`);

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });

    const raw = await response.text();
    console.log(`[uploadFile] Status: ${response.status} | Response: ${raw.substring(0, 300)}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: `kie.ai upload falhou: ${raw}` });
    }

    const data = JSON.parse(raw);
    // A URL de download fica em data.downloadUrl ou data.data.downloadUrl
    const downloadUrl =
      data?.downloadUrl ||
      data?.data?.downloadUrl ||
      data?.data?.url ||
      data?.url ||
      null;

    if (!downloadUrl) {
      console.error('[uploadFile] downloadUrl não encontrado:', raw);
      return res.status(500).json({ error: 'URL não retornada pelo kie.ai', raw });
    }

    console.log(`[uploadFile] ✓ URL: ${downloadUrl}`);
    return res.status(200).json({ success: true, url: downloadUrl });

  } catch (err) {
    console.error('[uploadFile] Erro:', err);
    return res.status(500).json({ error: err.message });
  }
}
