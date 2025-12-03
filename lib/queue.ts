import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const emailQueue = new Queue('email', { connection });

export const createWorker = (name: string, processor: (job: any) => Promise<any>) => {
  return new Worker(name, processor, { connection });
};
