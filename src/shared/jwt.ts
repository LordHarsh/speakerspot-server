import * as JWT from 'jsonwebtoken';
import config from '../config';

export default function generateToken(
  id: number,
  email: string,
  role: string,
): string {
  return JWT.sign({ id, email, role }, config.jwtSecret, {
    expiresIn: '7d',
    algorithm: 'HS256',
  } as JWT.SignOptions);
}

export function verifyToken(token: string): {
  id: number;
  email: string;
  role: string;
} {
  const data = JWT.verify(token, config.jwtSecret) as string;
  return data as unknown as { id: number; email: string; role: string };
}
