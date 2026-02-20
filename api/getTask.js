// api/getTask.js — Proxy para consultar status da task

const API_KEY = process.env.KIE_API_KEY || '64496667f7fdcf0d42da56dd49599ec7';
const KIE_BASE = 'https://api.kie.ai/api/v1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: 'taskId obrigatório' });

  // Tenta múltiplos endpoints de status do kie.ai
  const endpoints = [
    `${KIE_BASE}/jobs/getTaskDetail?taskId=${taskId}`,
    `${KIE_BASE}/jobs/queryTask?taskId=${taskId}`,
    `${KIE_BASE}/playground/recordInfo?taskId=${taskId}`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${API_KEY}` },
      });
      if (!response.ok) continue;

      const raw = await response.text();
      let data;
      try { data = JSON.parse(raw); } catch { continue; }

      // Verifica se tem dados relevantes
      if (data && (data.data != null || data.code === 200)) {
        console.log(`[getTask] OK via ${url} | status: ${data?.data?.status || data?.data?.taskStatus}`);
        return res.status(200).json(data);
      }
    } catch (err) {
      console.warn(`[getTask] Falhou ${url}:`, err.message);
    }
  }

  return res.status(404).json({ error: 'Task não encontrada em nenhum endpoint' });
}
