// api/getTask.js
// Proxy para consultar status da task

const API_KEY = process.env.KIE_API_KEY || '64496667f7fdcf0d42da56dd49599ec7';
const KIE_BASE = 'https://api.kie.ai/api/v1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: 'taskId obrigatório' });

  try {
    const response = await fetch(
      `${KIE_BASE}/jobs/getTaskDetail?taskId=${taskId}`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${API_KEY}` },
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    console.error('getTask proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
