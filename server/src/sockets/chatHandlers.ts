import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '../config/db';

/**
 * Register real-time chat room and messaging handlers for a connected socket
 */
export const registerChatHandlers = (io: SocketIOServer, socket: Socket): void => {
  const currentUserId = socket.data.user?.userId;
  const userRole = socket.data.user?.role;

  /**
   * Join a specific conversation room
   * Event: 'join_conversation'
   * Payload: { conversationId: string }
   */
  socket.on(
    'join_conversation',
    async (
      payload: { conversationId: string },
      callback?: (response: { success: boolean; message?: string; room?: string }) => void
    ) => {
      try {
        const { conversationId } = payload || {};

        if (!conversationId || typeof conversationId !== 'string') {
          const err = { success: false, message: 'Invalid or missing conversationId' };
          socket.emit('error', err);
          callback?.(err);
          return;
        }

        // 1. Locate conversation in database
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { id: true, buyerId: true, sellerId: true },
        });

        if (!conversation) {
          const err = { success: false, message: 'Conversation not found' };
          socket.emit('error', err);
          callback?.(err);
          return;
        }

        // 2. Authorization guard: must be buyer, seller, or platform admin
        const isParticipant =
          conversation.buyerId === currentUserId ||
          conversation.sellerId === currentUserId ||
          userRole === 'ADMIN';

        if (!isParticipant) {
          const err = {
            success: false,
            message: 'You are not a participant in this conversation',
          };
          socket.emit('error', err);
          callback?.(err);
          return;
        }

        // 3. Join the Socket.IO room named by conversationId
        await socket.join(conversationId);
        console.log(
          `[Socket.IO] User ${currentUserId} joined conversation room: ${conversationId}`
        );

        const res = {
          success: true,
          room: conversationId,
          message: 'Joined conversation room successfully',
        };
        socket.emit('conversation_joined', { conversationId });
        callback?.(res);
      } catch (error) {
        console.error('[Socket.IO] Error in join_conversation:', error);
        const err = { success: false, message: 'Internal error joining conversation' };
        socket.emit('error', err);
        callback?.(err);
      }
    }
  );

  /**
   * Leave a specific conversation room
   * Event: 'leave_conversation'
   * Payload: { conversationId: string }
   */
  socket.on(
    'leave_conversation',
    async (
      payload: { conversationId: string },
      callback?: (response: { success: boolean; message?: string }) => void
    ) => {
      try {
        const { conversationId } = payload || {};
        if (conversationId && typeof conversationId === 'string') {
          await socket.leave(conversationId);
          console.log(
            `[Socket.IO] User ${currentUserId} left conversation room: ${conversationId}`
          );
        }
        const res = { success: true, message: 'Left conversation room successfully' };
        socket.emit('conversation_left', { conversationId });
        callback?.(res);
      } catch (error) {
        console.error('[Socket.IO] Error in leave_conversation:', error);
        callback?.({ success: false, message: 'Internal error leaving conversation' });
      }
    }
  );

  /**
   * Send a real-time message and persist to database
   * Event: 'send_message'
   * Payload: { conversationId: string, text: string, attachmentUrl?: string }
   */
  socket.on(
    'send_message',
    async (
      payload: { conversationId: string; text: string; attachmentUrl?: string },
      callback?: (response: { success: boolean; data?: any; message?: string }) => void
    ) => {
      try {
        const { conversationId, text, attachmentUrl } = payload || {};

        // 1. Payload validation
        if (!conversationId || typeof conversationId !== 'string') {
          const err = { success: false, message: 'Invalid or missing conversationId' };
          socket.emit('error', err);
          callback?.(err);
          return;
        }

        if (!text || typeof text !== 'string' || !text.trim()) {
          const err = { success: false, message: 'Message text cannot be empty' };
          socket.emit('error', err);
          callback?.(err);
          return;
        }

        if (text.trim().length > 2000) {
          const err = { success: false, message: 'Message text cannot exceed 2000 characters' };
          socket.emit('error', err);
          callback?.(err);
          return;
        }

        // 2. Locate conversation and verify participant authorization
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { id: true, buyerId: true, sellerId: true },
        });

        if (!conversation) {
          const err = { success: false, message: 'Conversation not found' };
          socket.emit('error', err);
          callback?.(err);
          return;
        }

        const isParticipant =
          conversation.buyerId === currentUserId ||
          conversation.sellerId === currentUserId ||
          userRole === 'ADMIN';

        if (!isParticipant) {
          const err = {
            success: false,
            message: 'You are not a participant in this conversation',
          };
          socket.emit('error', err);
          callback?.(err);
          return;
        }

        // 3. Atomically persist message in MySQL and touch conversation updatedAt
        const [savedMessage] = await prisma.$transaction([
          prisma.message.create({
            data: {
              conversationId,
              senderId: currentUserId!,
              text: text.trim(),
              attachmentUrl: attachmentUrl?.trim() || null,
            },
            include: {
              sender: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          }),
          prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          }),
        ]);

        console.log(
          `[Socket.IO] User ${currentUserId} sent message ${savedMessage.id} in conversation ${conversationId}`
        );

        // 4. Broadcast to other participants in the conversation room
        socket.to(conversationId).emit('new_message', savedMessage);

        // 5. Acknowledge sender callback with the saved message
        callback?.({ success: true, data: savedMessage });
      } catch (error) {
        console.error('[Socket.IO] Error in send_message:', error);
        const err = { success: false, message: 'Failed to send and persist message' };
        socket.emit('error', err);
        callback?.(err);
      }
    }
  );

  /**
   * Ephemeral typing indicator
   * Event: 'typing'
   * Payload: { conversationId: string }
   */
  socket.on('typing', (payload: { conversationId: string }) => {
    const { conversationId } = payload || {};
    if (conversationId && typeof conversationId === 'string') {
      socket.to(conversationId).emit('user_typing', {
        conversationId,
        userId: currentUserId,
        email: socket.data.user?.email,
      });
    }
  });

  /**
   * Ephemeral stop-typing indicator
   * Event: 'stop_typing'
   * Payload: { conversationId: string }
   */
  socket.on('stop_typing', (payload: { conversationId: string }) => {
    const { conversationId } = payload || {};
    if (conversationId && typeof conversationId === 'string') {
      socket.to(conversationId).emit('user_stop_typing', {
        conversationId,
        userId: currentUserId,
      });
    }
  });

  /**
   * Mark messages as read in conversation
   * Event: 'mark_read'
   * Payload: { conversationId: string }
   */
  socket.on(
    'mark_read',
    async (
      payload: { conversationId: string },
      callback?: (response: { success: boolean; message?: string }) => void
    ) => {
      try {
        const { conversationId } = payload || {};
        if (!conversationId || typeof conversationId !== 'string') {
          callback?.({ success: false, message: 'Invalid or missing conversationId' });
          return;
        }

        // Update unread messages sent by the other participant
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: currentUserId },
            isRead: false,
          },
          data: { isRead: true },
        });

        // Broadcast read receipt to room
        io.to(conversationId).emit('messages_read', {
          conversationId,
          readerId: currentUserId,
        });

        callback?.({ success: true, message: 'Messages marked as read successfully' });
      } catch (error) {
        console.error('[Socket.IO] Error in mark_read:', error);
        callback?.({ success: false, message: 'Failed to mark messages as read' });
      }
    }
  );
};
