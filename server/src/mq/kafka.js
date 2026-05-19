import { Kafka } from 'kafkajs';
import { config } from '../config.js';

export const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers
});

export async function createProducer() {
  const producer = kafka.producer();
  await producer.connect();
  return producer;
}

export async function createConsumer({ groupId, fromBeginning = false, topic }) {
  const consumer = kafka.consumer({ groupId, fromBeginning });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning });
  return consumer;
}

