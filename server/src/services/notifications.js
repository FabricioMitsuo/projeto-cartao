import { putItem, TABLES } from '../db/dynamo.js';

export async function sendNotification({ userId, channel, message, correlationId }) {
  // Simulação: grava no DynamoDB Notifications.
  await putItem(TABLES.Notifications, {
    notificationId: `${Date.now()}-${channel}`,
    userId,
    channel,
    message,
    correlationId,
    createdAt: Date.now(),
    status: 'SENT_SIMULATED'
  });

  // Para o portfolio, também logamos claramente.
  console.log(`[NOTIF] userId=${userId} channel=${channel} correlationId=${correlationId} message=${message}`);
}

export async function sendChatMessage({ userId, message, correlationId }) {
  await putItem(TABLES.Notifications, {
    notificationId: `${Date.now()}-chat`,
    userId,
    channel: 'CHAT',
    message,
    correlationId,
    createdAt: Date.now(),
    status: 'SENT_SIMULATED'
  });

  console.log(`[CHAT] userId=${userId} correlationId=${correlationId} message=${message}`);
}

