# Banco Digital (Portfolio) — Kafka + DynamoDB + SQS

> Objetivo do projeto: mostrar um fluxo event-driven completo (UI → API → Kafka → processamento → SQS → notificação) com persistência em **DynamoDB local**, além de autenticação com **Login + MFA**.

## Arquitetura (alta visão)
- **Front**: `index.html` (UI estática no GitHub Pages)
- **Backend**: Node/Express em `server/`
- **Persistência**: DynamoDB local (dynamodb-local)
- **Eventos de domínio**: Kafka (tópicos `bank.account.events`)
- **Notificações**: SQS local (ElasticMQ) + worker consome e “envia” Email/SMS/Chat **simulados** (logs + persistência)

## Importante sobre GitHub Pages
GitHub Pages **não executa** Kafka/DynamoDB/SQS no navegador. Portanto:
- O **Pages publica somente a UI**.
- Para o fluxo funcionar, você precisa rodar o **backend localmente** (ou em um servidor) e a UI chamar `http://localhost:3000` via `fetch`.

---

## 1) Subir a infra local (Kafka + DynamoDB + SQS)
1. Instale e abra **Docker Desktop**.
2. Rode:
```bash
docker-compose up -d
```

Isso inicia:
- Kafka (porta `9092`)
- DynamoDB local (porta `8000`)
- ElasticMQ/SQS local (porta `9324`)

---

## 2) Rodar o backend
1. Abra um terminal e execute:
```bash
cd server
npm install
npm run dev
```

2. O servidor sobe em:
- `http://localhost:3000`

Seed para testes (já criado no backend):
- **login**: `demo@bank.com`
- **senha**: `123456`

---

## 3) Endpoints (Backend)
### Auth
- `POST /api/auth/login`
  - body: `{ "login": "demo@bank.com", "password": "123456" }`
  - resposta: `{ sessionId, mfaRequired: true }`

- `POST /api/auth/mfa/verify`
  - body: `{ "sessionId": "...", "otp": "123456" }`
  - resposta: `{ ok: true }`

> O OTP é “enviado” como **EMAIL_SIM** e **SMS_SIM** (simulado) e aparece também no log do backend.

### Dashboard
- `GET /api/state`
  - header: `Authorization: Bearer <sessionId>`

### PIX
- `POST /api/pix/limit`
  - header: `Authorization: Bearer <sessionId>`
  - body: `{ "newLimit": 1234 }`
  - comportamento:
    - grava no DynamoDB
    - publica evento Kafka
    - worker detecta violação (regra simulada) e dispara notificações via SQS

---

## 4) Frontend (GitHub Pages + testes locais)
### Como a UI chama o backend
- A UI deve fazer `fetch('http://localhost:3000/...')`.
- Abra:
  - `index.html` no navegador (file://) *pode* causar bloqueios.
  - Recomendado: servir via um servidor estático (por exemplo, VSCode Live Server) para evitar limitações de CORS.

### Publicação no GitHub Pages
1. Faça commit e push.
2. Repo → Settings → Pages:
   - Source: “Deploy from a branch”
   - Branch: `main`
   - Folder: `/ (root)` ou `/docs` (dependendo do seu setup)
3. Garanta que a saída tenha `index.html`, `script.js`, `style.css`.

---

## 5) Passo-a-passo de demonstração (portfolio)
1. Suba a infra: `docker-compose up -d`
2. Rode o backend: `cd server && npm install && npm run dev`
3. Abra a UI (`index.html`).
4. Faça login com:
   - `demo@bank.com` / `123456`
5. Insira o OTP (use o log do backend).
6. No dashboard, clique em **Alterar limite PIX** para um valor baixo (ex.: `200`), para disparar violação.
7. Veja:
   - evento no Kafka (log do worker)
   - notificação chegando no painel (quando o front for adaptado)
   - email/sms/chat simulados persistidos no DynamoDB (logs)

---

## Status do projeto (importante)
Neste momento:
- **Backend + infra**: já implementados e prontos.
- **Front**: seu `index.html/script.js/style.css` ainda precisa ser remodelado para o dashboard completo (login/MFA + cards + botões + painel de notificações/chat) chamando os endpoints do backend.

Quando você aprovar, eu vou:
- reescrever `index.html` para as telas de Login/MFA e Dashboard
- reescrever `script.js` para consumir a API (`/api/auth/*`, `/api/state`, `/api/pix/limit`)
- atualizar `style.css` com layout do banco digital

