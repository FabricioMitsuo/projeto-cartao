import { bus, topics } from './bus.js';
import { notificationsQueue } from './queue.js';
import { state } from './db.js';

export function setupFallbackWorkers() {
  // Kafka-like consumer for account events
  bus.on(topics.accountEvents, async (payload) => {
    if (payload.type === 'PIX_LIMIT_CHANGED') {
      const { userId, correlationId, newLimit } = payload;
      const limit = Number(newLimit);

      // Regra simulada: se limit < 3000, uso = 120% do limite; senão, 70%
      const currentUsage = limit < 3000 ? limit * 1.2 : limit * 0.7;

      if (currentUsage > limit) {
        await notificationsQueue.send({
          eventType: 'PIX_LIMIT_EXCEEDED',
          userId,
          correlationId,
          limit,
          currentUsage,
          createdAt: Date.now()
        });
      }
    }
  });

  // SQS-like worker for notifications
  (async () => {
    while (true) {
      const msg = await notificationsQueue.receive();
      if (!msg) continue;

      const { userId, correlationId, eventType, limit, currentUsage } = msg;
      if (eventType === 'PIX_LIMIT_EXCEEDED') {
        const text = `Atenção: seu limite PIX foi excedido. Limite=${limit} Uso=${currentUsage}`;
        state.notifications.push({
          notificationId: `${Date.now()}-EMAIL_SIM`,
          userId,
          channel: 'EMAIL_SIM',
          message: text,
          correlationId,
          createdAt: Date.now(),
          status: 'SENT_SIMULATED'
        });
        state.notifications.push({
          notificationId: `${Date.now()}-SMS_SIM`,
          userId,
          channel: 'SMS_SIM',
          message: text,
          correlationId,
          createdAt: Date.now(),
          status: 'SENT_SIMULATED'
        });
        state.notifications.push({
          notificationId: `${Date.now()}-CHAT`,
          userId,
          channel: 'CHAT',
          message: text,
          correlationId,
          createdAt: Date.now(),
          status: 'SENT_SIMULATED'
        });
      }
    }
  })().catch(console.error);
}

