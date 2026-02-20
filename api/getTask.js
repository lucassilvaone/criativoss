// api/getTask.js — Proxy status da task

const API_KEY = process.env.KIE_API_KEY || '64496667f7fdcf0d42da56dd49599ec7';
const BASE = 'https://api.kie.ai/api/v1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: 'taskId obrigatório' });

  const endpoints = [
    `${BASE}/jobs/getTaskDetail?taskId=${taskId}`,
    `${BASE}/jobs/queryTask?taskId=${taskId}`,
    `${BASE}/playground/recordInfo?taskId=${taskId}`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
      });
      if (!response.ok) continue;
      const raw = await response.text();
      const data = JSON.parse(raw);
      if (data && data.code === 200) {
        const status = data?.data?.status || data?.data?.taskStatus || 'unknown';
        console.log(`[getTask] ${taskId} → ${status} via ${url.split('/').pop()}`);
        return res.status(200).json(data);
      }
    } catch {}
  }

  return res.status(404).json({ error: 'Task não encontrada' });
}
