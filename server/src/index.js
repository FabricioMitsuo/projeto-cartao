import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config.js';
import { getItem as getItemDdb, putItem as putItemDdb, updateItem as updateItemDdb, TABLES } from './db/dynamo.js';
import { getItem as getItemFallback, putItem as putItemFallback, updateItem as updateItemFallback, TABLES as TABLES_FALLBACK } from './fallback/db.js';

import { createProducer, createConsumer } from './mq/kafka.js';
import { topics } from './mq/topics.js';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { sendNotification, sendChatMessage } from './services/notifications.js';
import { verifyMfa, startMfa } from './services/mfa.js';

import { resetDemoData, state as fallbackState } from './fallback/db.js';
import { bus, topics as fallbackTopics } from './fallback/bus.js';
import { setupFallbackWorkers } from './fallback/integration.js';
import { notificationsQueue } from './fallback/queue.js';


const USE_FALLBACK = true;



const app = express();
app.use(cors());
app.use(express.json());

let sqs = null;
let queueUrl = null;

if (!USE_FALLBACK) {
  sqs = new SQSClient({
    endpoint: config.sqs.endpoint,
    region: config.sqs.region
  });
  queueUrl = config.sqs.queueUrl;
}


function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });
  req.sessionId = token;
  next();
}

async function getAuthedSession(sessionId) {
  const sess = await getItem(TABLES.Sessions, { sessionId });
  if (!sess) return null;
  if (!sess.mfaVerified) return null;
  if (sess.expiresAt < Date.now()) return null;
  return sess;
}

// Routes
app.post('/api/auth/login', async (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password) return res.status(400).json({ error: 'LOGIN_AND_PASSWORD_REQUIRED' });

  const user = await getItem(TABLES.Users, { login });
  if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

  // Cria sessão base (mfaVerified=false) e inicia OTP
  const sessionId = uuidv4();
  await putItem(TABLES.Sessions, {
    sessionId,
    userId: user.userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
    mfaVerified: false,
    mfaOtp: null,
    mfaOtpExpiresAt: 0
  });

  // startMfa usa updateItem que tenta inserir; ajustamos para gravar diretamente aqui
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  await updateItem(
    TABLES.Sessions,
    { sessionId },
    'SET #otp = :otp, #exp = :exp',
    { ':otp': otp, ':exp': Date.now() + 5 * 60 * 1000 },
    { '#otp': 'mfaOtp', '#exp': 'mfaOtpExpiresAt' }
  );

  // Simula envio email/SMS
  const correlationId = uuidv4();
  await sendNotification({
    userId: user.userId,
    channel: 'EMAIL_SIM',
    correlationId,
    message: `Seu código MFA é ${otp}`
  });
  await sendNotification({
    userId: user.userId,
    channel: 'SMS_SIM',
    correlationId,
    message: `Seu código MFA é ${otp}`
  });

  res.json({
    sessionId,
    mfaRequired: true
  });
});

app.post('/api/auth/mfa/verify', async (req, res) => {
  const { sessionId, otp } = req.body || {};
  if (!sessionId || !otp) return res.status(400).json({ error: 'SESSION_ID_AND_OTP_REQUIRED' });

  const result = await verifyMfa({ sessionId, otp });
  if (!result.ok) return res.status(401).json({ error: result.reason });

  res.json({ ok: true });
});

app.get('/api/state', requireAuth, async (req, res) => {
  const sess = await getAuthedSession(req.sessionId);
  if (!sess) return res.status(401).json({ error: 'UNAUTHORIZED' });

  const userId = sess.userId;

  const account = await getItem(TABLES.Accounts, { userId }) || { pixLimit: 500, checkingBalance: 1000 };
  const loans = (await getItem(TABLES.Loans, { userId })) || { consignedInstallment: 180, remainingBalance: 2200 };
  const investments = (await getItem(TABLES.Investments, { userId })) || { fundName: 'Fundo Tech', value: 5400, dailyRate: 0.012 };

  const notifs = [];
  // Para simplificar: buscamos últimas notificações via scan seria caro; vamos manter no front via endpoint separado depois.

  res.json({
    userId,
    checkingBalance: account.checkingBalance,
    pixLimit: account.pixLimit,
    loans,
    investments,
    notifs
  });
});

app.post('/api/pix/limit', requireAuth, async (req, res) => {
  const sess = await getAuthedSession(req.sessionId);
  if (!sess) return res.status(401).json({ error: 'UNAUTHORIZED' });

  const { newLimit } = req.body || {};
  const limit = Number(newLimit);
  if (!Number.isFinite(limit) || limit <= 0) return res.status(400).json({ error: 'INVALID_NEW_LIMIT' });

  const userId = sess.userId;
  const correlationId = uuidv4();

  await updateItem(
    TABLES.Accounts,
    { userId },
    'SET pixLimit = :l',
    { ':l': limit }
  ).catch(async () => {
    await putItem(TABLES.Accounts, { userId, pixLimit: limit, checkingBalance: 1000 });
  });

  if (USE_FALLBACK) {
    bus.emit(topics.accountEvents, {
      type: 'PIX_LIMIT_CHANGED',
      userId,
      newLimit: limit,
      correlationId,
      createdAt: Date.now()
    });
    return res.json({ ok: true, correlationId });
  }

  // publica evento Kafka
  const producer = await createProducer();

  await producer.send({
    topic: topics.accountEvents,
    messages: [
      {
        key: String(userId),
        value: JSON.stringify({
          type: 'PIX_LIMIT_CHANGED',
          userId,
          newLimit: limit,
          correlationId,
          createdAt: Date.now()
        })
      }
    ]
  });
  await producer.disconnect();

  res.json({ ok: true, correlationId });
});

app.post('/api/loans/consigned', requireAuth, async (req, res) => {
  const sess = await getAuthedSession(req.sessionId);
  if (!sess) return res.status(401).json({ error: 'UNAUTHORIZED' });

  const { installment, remainingBalance } = req.body || {};
  const userId = sess.userId;
  await putItem(TABLES.Loans, {
    userId,
    consignedInstallment: Number(installment ?? 180),
    remainingBalance: Number(remainingBalance ?? 2200)
  });

  res.json({ ok: true });
});

app.post('/api/investments', requireAuth, async (req, res) => {
  const sess = await getAuthedSession(req.sessionId);
  if (!sess) return res.status(401).json({ error: 'UNAUTHORIZED' });

  const { fundName, value, dailyRate } = req.body || {};
  const userId = sess.userId;
  await putItem(TABLES.Investments, {
    userId,
    fundName: fundName ?? 'Fundo Tech',
    value: Number(value ?? 5400),
    dailyRate: Number(dailyRate ?? 0.012)
  });

  res.json({ ok: true });
});

// Kafka consumer: detecta violação (simulada) e manda mensagem para SQS
async function startWorkers() {
  const producer = await createProducer();

  const consumer = await createConsumer({
    groupId: 'digital-bank-account-processor',
    fromBeginning: false,
    topic: topics.accountEvents
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString('utf8'));
      const { type, userId, correlationId } = payload;

      if (type === 'PIX_LIMIT_CHANGED') {
        // Regra de violação (demo): assume uso atual = 120% do limite antigo fictício
        // Para ficar demonstrável, simulamos “uso” = limit * 1.2 se limit < 3000
        const limit = Number(payload.newLimit);
        const currentUsage = limit < 3000 ? limit * 1.2 : limit * 0.7;

        if (currentUsage > limit) {
          const msg = {
            eventType: 'PIX_LIMIT_EXCEEDED',
            userId,
            correlationId,
            limit,
            currentUsage,
            createdAt: Date.now()
          };

          // Enfileira em SQS
          await sqs.send(new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(msg)
          }));

          await putItem(TABLES.Audit, {
            auditId: uuidv4(),
            userId,
            correlationId,
            type: 'PIX_LIMIT_EXCEEDED_ENQUEUED',
            createdAt: Date.now(),
            details: msg
          });

          console.log(`[KAFKA->SQS] Enqueued notifications for userId=${userId} correlationId=${correlationId}`);
        }
      }
    }
  });

  // Worker SQS: consome notificações e dispara email/sms/chat simulados
  async function sqsLoop() {
    while (true) {
      try {
        const resp = await sqs.send(new ReceiveMessageCommand({
          QueueUrl: queueUrl,
          MaxNumberOfMessages: 5,
          WaitTimeSeconds: 10,
          VisibilityTimeout: 30
        }));

        const messages = resp.Messages ?? [];
        for (const m of messages) {
          const body = JSON.parse(m.Body);
          const { userId, correlationId, eventType, limit, currentUsage } = body;

          if (eventType === 'PIX_LIMIT_EXCEEDED') {
            const text = `Atenção: seu limite PIX foi excedido. Limite=${limit} Uso=${currentUsage}`;
            await sendNotification({ userId, channel: 'EMAIL_SIM', correlationId, message: text });
            await sendNotification({ userId, channel: 'SMS_SIM', correlationId, message: text });
            await sendChatMessage({ userId, correlationId, message: text });
          }

          await sqs.send(new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: m.ReceiptHandle
          }));
        }
      } catch (e) {
        console.error('[SQS worker] error', e);
      }
    }
  }

  sqsLoop().catch(console.error);
}

// Seed mínimo para demo
async function seed() {
  const login = 'demo@bank.com';
  const userId = 'user-demo';
  const passwordHash = await bcrypt.hash('123456', 10);

  // tenta inserir (vamos sobrescrever via put)
  await putItem(TABLES.Users, { login, userId, passwordHash, mfaEnabled: true });

  await putItem(TABLES.Accounts, { userId, checkingBalance: 1000, pixLimit: 500 });
  await putItem(TABLES.Loans, { userId, consignedInstallment: 180, remainingBalance: 2200 });
  await putItem(TABLES.Investments, { userId, fundName: 'Fundo Tech', value: 5400, dailyRate: 0.012 });

  await putItem(TABLES.Audit, {
    auditId: uuidv4(),
    userId,
    correlationId: 'seed',
    type: 'SEED_READY',
    createdAt: Date.now(),
    details: { login }
  });

  console.log('[seed] created demo user login=demo@bank.com password=123456');
}

app.listen(config.PORT, async () => {
  console.log(`[server] listening on :${config.PORT}`);
  await seed();

  if (USE_FALLBACK) {
    setupFallbackWorkers();
  } else {
    await startWorkers();
  }
});


