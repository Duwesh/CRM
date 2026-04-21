import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async (options) => {
  try {
    await resend.emails.send({
      from: options.from ?? env.EMAIL_FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error('Email send failed:', error);
    // Don't throw — email failure shouldn't crash the request
  }
};
