import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketAuthMiddleware } from './middleware';
import { registerChatHandlers } from './chatHandlers';
import { isOriginAllowed } from '../utils/cors';

let ioInstance: SocketIOServer | null = null;

/**
 * Initializes and binds the Socket.IO server to the HTTP server instance
 */
export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  const isDev = process.env.NODE_ENV !== 'production';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin, clientUrl, isDev)) {
          return callback(null, true);
        }
        return callback(new Error(`Socket CORS blocked origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Register Socket.IO JWT authentication middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(
      `[Socket.IO] Authenticated client connected: ${socket.id} (user: ${user?.email}, id: ${user?.userId})`
    );

    // Register real-time chat room and message handlers
    registerChatHandlers(io, socket);

    // Echo/ping verification handler
    socket.on('ping_test', (payload: any) => {
      socket.emit('pong_test', {
        ...payload,
        serverTime: new Date().toISOString(),
      });
    });

    // Whoami event returning authenticated user session data
    socket.on('whoami', () => {
      socket.emit('whoami_response', {
        user: socket.data.user,
        socketId: socket.id,
      });
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`[Socket.IO] Client disconnected (${socket.id}): ${reason}`);
    });
  });

  ioInstance = io;
  return io;
};

/**
 * Get active singleton Socket.IO instance
 */
export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized. Call initSocketServer(httpServer) first.');
  }
  return ioInstance;
};
