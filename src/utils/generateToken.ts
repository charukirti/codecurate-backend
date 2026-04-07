import jwt, { SignOptions } from 'jsonwebtoken';
import authConfig from '../config/auth.config.js';

export function generateAccessToken(
  userId: string,
  role: string,
  isVerified: boolean
) {
  return jwt.sign({ userId, role, isVerified }, authConfig.access_secret, {
    expiresIn: authConfig.access_token_expiry as SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ userId }, authConfig.refresh_secret, {
    expiresIn: authConfig.refresh_token_expiry as SignOptions['expiresIn'],
  });
}
