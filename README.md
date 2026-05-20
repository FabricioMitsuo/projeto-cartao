# Banco Digital (Portfolio) — Kafka + DynamoDB + SQS

> Demonstração de fluxo **event-driven** completo (UI → API → Kafka → processamento → SQS → notificação) com persistência em **DynamoDB local**, além de autenticação com **Login + MFA**.

## Como funciona (visão rápida)
- **Front**: `index.html` (UI estática)
- **Backend**: `server/` (API REST)
- **DynamoDB local**: persistência do usuário/sessão/contas/notificações
- **Kafka**: eventos de domínio (ex.: alteração de limite PIX)
- **ElasticMQ/SQS**: fila para notificações ao cliente (email/SMS/chat simulados)

> GitHub Pages **não executa** Kafka/DynamoDB/SQS no navegador. Ele hospeda apenas a UI.

---

## 1) Rodar a infra local
1. Instale **Docker Desktop**.
2. No projeto:
```bash
docker compose up -d
```

A infra sobe com:
- Kafka: `9092`
- DynamoDB local: `8000`
- ElasticMQ/SQS: `9324`

---

## 2) Rodar o backend
1. Instale dependências:
```bash
cd server
npm install
```
2. Rode:
```bash
npm run dev
```
3. Backend em:
- `http://localhost:3000`

Seed para testes (já criado no backend):
- login: `demo@bank.com`
- senha: `123456`

---

## 3) Fluxo de testes (Login + MFA)
1. Chame:
- `POST /api/auth/login` com `{ "login": "demo@bank.com", "password": "123456" }`
2. O backend responde com `{ sessionId, mfaRequired: true }`.
3. O OTP é “enviado” como **EMAIL_SIM**/**SMS_SIM** e aparece no log do backend.
4. Chame:
- `POST /api/auth/mfa/verify` com `{ sessionId, otp }`
5. Após MFA, use `GET /api/state` com header:
- `Authorization: Bearer <sessionId>`

---

## 4) Testar alteração de limite PIX (gera notificação se exceder)
1. Logado (MFA OK), chame:
- `POST /api/pix/limit`
- header: `Authorization: Bearer <sessionId>`
- body: `{ "newLimit": 200 }` (ex.: baixo para disparar)
2. Backend publica evento no Kafka.
3. Worker Kafka detecta violação (regra simulada) e enfileira notificação no SQS.
4. Worker SQS consome e envia **email/sms/chat simulados** (logs + persistência).

---

## 5) Frontend (GitHub Pages)
- Para testar localmente: abra o `index.html` com um servidor estático (ex.: Live Server).
- A UI deve fazer fetch para: `http://localhost:3000/...`

---

## Próximo passo (para ficar “redondo” no portfolio)
Seu projeto já tem **backend + infra**, mas o `index.html/script.js/style.css` ainda precisa ser adaptado para:
- telas de Login + MFA
- dashboard do banco digital
- painel de notificações + chat
- formulário/botão de alteração do limite PIX

