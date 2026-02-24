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
    html: `<p>click on this link to verify your email</p><br/><a href="${verificationLink}">Verify Email</a>`,
  });
  return message;
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const verificationLink = `${authConfig.base_url}/v1/auth/reset-password?token=${token}`;
  const message = await transporter.sendMail({
    from: authConfig.smtp_user,
    to: to,
    subject: 'Reset your password',
    text: 'click on this link to reset your',
    html: `<p>click on this link to reset your password</p><br/><a href="${verificationLink}">Reset your password</a>`,
  });
  return message;
}
