# 🚀 Deploy no Vercel — Passo a Passo

## Estrutura do projeto
```
creative-studio-vercel/
├── public/
│   └── index.html        ← Frontend do app
├── api/
│   ├── createTask.js     ← Proxy: cria task na kie.ai
│   ├── getTask.js        ← Proxy: consulta status da task
│   └── uploadFile.js     ← Proxy: faz upload de imagens
├── vercel.json           ← Configuração do Vercel
├── package.json
└── README.md
```

---

## 📦 Opção 1: Deploy via GitHub (Recomendado)

### Passo 1 — Criar repositório no GitHub
1. Acesse [github.com/new](https://github.com/new)
2. Nomeie o repositório: `creative-studio`
3. Deixe **Private** (protege sua API key)
4. Clique em **Create repository**

### Passo 2 — Subir os arquivos
```bash
# No terminal, dentro da pasta creative-studio-vercel/
git init
git add .
git commit -m "Creative Studio - Nano Banana Pro"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/creative-studio.git
git push -u origin main
```

### Passo 3 — Conectar ao Vercel
1. Acesse [vercel.com](https://vercel.com) e crie conta (grátis)
2. Clique em **Add New → Project**
3. Clique em **Import** no repositório `creative-studio`
4. Na tela de configuração, não mude nada — clique **Deploy**
5. ✅ Aguarde ~30 segundos — seu site estará no ar!

---

## 📦 Opção 2: Deploy via Vercel CLI (mais rápido)

### Instalar o Vercel CLI
```bash
npm install -g vercel
```

### Fazer deploy
```bash
# Na pasta creative-studio-vercel/
vercel

# Responda as perguntas:
# ? Set up and deploy? → Y
# ? Which scope? → sua conta
# ? Link to existing project? → N
# ? Project name → creative-studio
# ? In which directory is your code? → ./
# ? Override settings? → N
```

### Para deploy em produção:
```bash
vercel --prod
```

---

## 🔐 Variável de Ambiente (opcional, mais seguro)

Para não deixar a API key no código, configure no Vercel:

1. No dashboard do Vercel, vá em **Settings → Environment Variables**
2. Adicione:
   - **Name:** `KIE_API_KEY`
   - **Value:** `64496667f7fdcf0d42da56dd49599ec7`
   - **Environment:** Production, Preview, Development
3. Clique **Save**
4. Faça redeploy: **Deployments → Redeploy**

Os arquivos `api/*.js` já estão configurados para ler `process.env.KIE_API_KEY`.

---

## 🌐 Resultado

Após o deploy, você terá uma URL tipo:
```
https://creative-studio-xxx.vercel.app
```

Acesse e use normalmente — sem CORS, sem erros! 🎉

---

## ⚡ Domínio customizado (opcional)

No Vercel → **Settings → Domains** → adicione seu domínio.
