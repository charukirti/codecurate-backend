import nodemailer from 'nodemailer';
import authConfig from '../config/auth.config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: authConfig.smtp_user,
    pass: authConfig.smtp_password,
  },
});

export async function sendVerificationEmail(to: string, token: string) {
  const verificationLink = `${authConfig.base_url}/v1/auth/verify-email?token=${token}`;
  const message = await transporter.sendMail({
    from: authConfig.smtp_user,
    to: to,
    subject: 'Verify your email',
    text: 'click on this link to verify your email',
    html: `<a href="${verificationLink}">Verify Email</a>`,
  });
  return message;
}
