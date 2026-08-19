import { config } from 'dotenv';
config();
import nodemailer from 'nodemailer';

const host = process.env.MAILTRAP_SMTP_HOST || 'sandbox.smtp.mailtrap.io';
const port = Number.parseInt(process.env.MAILTRAP_SMTP_PORT || '2525', 10);
const user = process.env.MAILTRAP_SMTP_USER;
const pass = process.env.MAILTRAP_SMTP_PASS;

if (!Number.isInteger(port)) {
  throw new Error('MAILTRAP_SMTP_PORT must be a valid number');
}

export const emailTransport = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

export const sender = {
  address: process.env.EMAIL_FROM || 'from@example.com',
  name: process.env.EMAIL_FROM_NAME || 'LinkedIn Clone',
};

export const emailTransportMode = host.startsWith('sandbox.')
  ? 'sandbox'
  : 'production';

export const verifyEmailTransport = async () => {
  if (!user || !pass) {
    throw new Error(
      'MAILTRAP_SMTP_USER and MAILTRAP_SMTP_PASS are required',
    );
  }

  return emailTransport.verify();
};

