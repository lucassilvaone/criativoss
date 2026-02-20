// api/uploadFile.js
// Proxy para upload de imagem para kie.ai

const API_KEY = process.env.KIE_API_KEY || '64496667f7fdcf0d42da56dd49599ec7';
const KIE_BASE = 'https://api.kie.ai/api/v1';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Recebe base64 do frontend, converte para Blob e envia ao kie.ai
    const { base64, filename, mimeType } = req.body;

    if (!base64) {
      return res.status(400).json({ error: 'base64 obrigatório' });
    }

    // Converte base64 para buffer
    const b64Data = base64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(b64Data, 'base64');
    const mime = mimeType || 'image/png';
    const fname = filename || `upload_${Date.now()}.png`;

    // Monta FormData manualmente (Node.js nativo)
    const boundary = `----FormBoundary${Date.now()}`;
    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fname}"\r\nContent-Type: ${mime}\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, buffer, footer]);

    const response = await fetch(`${KIE_BASE}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
      body,
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    console.error('uploadFile proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
