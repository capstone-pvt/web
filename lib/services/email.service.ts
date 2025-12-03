import { emailQueue } from '@/lib/queue';

export class EmailService {
  static async sendWelcomeEmail(to: string, name: string) {
    await emailQueue.add('sendWelcomeEmail', {
      to,
      subject: 'Welcome to our platform!',
      body: `Hi ${name}, welcome to our platform!`,
    });
  }
}
