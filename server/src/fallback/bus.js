import { EventEmitter } from 'node:events';

// Event bus in-process (fallback for Kafka)
export const bus = new EventEmitter();

export const topics = {
  accountEvents: 'bank.account.events'
};

