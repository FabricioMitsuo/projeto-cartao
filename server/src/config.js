import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: Number(process.env.PORT ?? 3000),

  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID ?? 'digital-bank',
    brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',').map(s => s.trim())
  },

  dynamodb: {
    endpoint: process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000',
    region: process.env.AWS_REGION ?? 'us-east-1'
  },

  sqs: {
    endpoint: process.env.SQS_ENDPOINT ?? 'http://localhost:9324',
    region: process.env.AWS_REGION ?? 'us-east-1',
    queueUrl: process.env.SQS_QUEUE_URL ?? 'http://localhost:9324/queue/notifications'
  }
};

