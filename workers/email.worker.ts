import { createWorker } from '@/lib/queue';

console.log('Email worker started');

createWorker('email', async (job) => {
  console.log('Processing email job:', job.data);
  // Simulate sending an email
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('Email sent to:', job.data.to);
});
