import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { config } from '../config/index';
import { logger } from '../utils/logger';

let io: SocketIOServer;

/**
 * Initialize Socket.IO and attach to the HTTP server.
 */
export function initWebSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    // Join a room for assignment-specific events
    socket.on('join:assignment', (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
      logger.debug(`Socket ${socket.id} joined room assignment:${assignmentId}`);
    });

    socket.on('leave:assignment', (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
      logger.debug(`Socket ${socket.id} left room assignment:${assignmentId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket client disconnected: ${socket.id} (${reason})`);
    });
  });

  logger.info('✅ WebSocket (Socket.IO) initialized');
  return io;
}

/**
 * Get the Socket.IO server instance.
 * Use this in workers/services to emit events.
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initWebSocket() first.');
  }
  return io;
}


