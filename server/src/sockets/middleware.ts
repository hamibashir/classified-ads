import { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { TokenPayload } from '../types/auth';
import { prisma } from '../config/db';

/**
 * Socket.IO middleware verifying JWT access token on connection handshake
 */
export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    // 1. Extract token from auth payload, headers, or query string
    let token: string | undefined;

    const auth = socket.handshake.auth;
    if (auth) {
      if (typeof auth.token === 'string') {
        token = auth.token;
      } else if (typeof auth.accessToken === 'string') {
        token = auth.accessToken;
      }
    }

    if (!token && socket.handshake.headers.authorization) {
      token = socket.handshake.headers.authorization;
    }

    if (!token && socket.handshake.query && typeof socket.handshake.query.token === 'string') {
      token = socket.handshake.query.token;
    }

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Strip "Bearer " prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    // 2. Cryptographically verify access token
    const result = verifyAccessToken(token);

    if (!result.valid || !result.payload) {
      const errMsg =
        result.error === 'TOKEN_EXPIRED'
          ? 'Authentication error: Token expired'
          : 'Authentication error: Invalid token';
      return next(new Error(errMsg));
    }

    const payload = result.payload;

    // 3. Check user existence and ban status in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isBanned: true },
    });

    if (!user) {
      return next(new Error('Authentication error: User account does not exist'));
    }

    if (user.isBanned) {
      return next(new Error('Authentication error: User account has been banned'));
    }

    // 4. Attach authenticated user session to socket
    socket.data.user = payload;
    next();
  } catch (error) {
    console.error('[Socket.IO Auth] Error verifying handshake:', error);
    next(new Error('Authentication error: Internal authentication error'));
  }
};
