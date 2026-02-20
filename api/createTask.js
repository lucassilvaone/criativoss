// api/createTask.js — Proxy para criar task na kie.ai

const API_KEY = process.env.KIE_API_KEY || '64496667f7fdcf0d42da56dd49599ec7';
const KIE_URL = 'https://api.kie.ai/api/v1/jobs/createTask';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    console.log('[createTask] Body:', JSON.stringify({
      ...req.body,
      input: { ...req.body?.input, image_input: `[${req.body?.input?.image_input?.length || 0} items]` }
    }));

    const response = await fetch(KIE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const raw = await response.text();
    console.log(`[createTask] Status: ${response.status} | Response: ${raw.substring(0, 300)}`);

    let data;
    try { data = JSON.parse(raw); } catch { data = { error: raw }; }

    return res.status(response.status).json(data);

  } catch (err) {
    console.error('[createTask] Erro:', err);
    return res.status(500).json({ error: err.message });
  }
}
