import jwt from 'jsonwebtoken';
import { env } from '../core/env';

export function signAccessToken(payload: { sub: string }) {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessTtl });
}
export function signRefreshToken(payload: { sub: string, jti: string }) {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshTtl });
}
export function verifyAccess(token: string) {
  return jwt.verify(token, env.jwtAccessSecret) as any;
}
export function verifyRefresh(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as any;
}
