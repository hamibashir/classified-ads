import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { CreateConversationInput } from '../schemas/chatSchemas';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * Initiate a new conversation or retrieve existing thread for an ad
 * POST /api/v1/chat/conversations
 */
export const createConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const buyerId = req.user?.userId;
    if (!buyerId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', undefined, 401);
      return;
    }

    const { adId, initialMessage }: CreateConversationInput = req.body;

    // 1. Locate ad
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
      },
    });

    if (!ad) {
      sendError(res, 'AD_NOT_FOUND', 'Classified ad not found', undefined, 404);
      return;
    }

    // 2. Prevent self-conversation
    if (ad.userId === buyerId) {
      sendError(
        res,
        'BAD_REQUEST',
        'You cannot start a conversation on your own ad',
        undefined,
        400
      );
      return;
    }

    // 3. Check if conversation already exists (@@unique([adId, buyerId]))
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        adId_buyerId: {
          adId,
          buyerId,
        },
      },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            currency: true,
            status: true,
            images: { orderBy: { order: 'asc' }, take: 1 },
          },
        },
        buyer: { select: { id: true, name: true, avatarUrl: true } },
        seller: { select: { id: true, name: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (existingConversation) {
      // Append initial message if provided
      if (initialMessage && initialMessage.trim()) {
        const newMessage = await prisma.message.create({
          data: {
            conversationId: existingConversation.id,
            senderId: buyerId,
            text: initialMessage.trim(),
          },
        });
        existingConversation.messages.unshift(newMessage);
      }

      const isBuyer = existingConversation.buyerId === buyerId;
      const otherUser = isBuyer ? existingConversation.seller : existingConversation.buyer;

      sendSuccess(
        res,
        {
          ...existingConversation,
          otherUser,
          unreadCount: 0,
          lastMessage: existingConversation.messages[0] || null,
          ad: {
            ...existingConversation.ad,
            price: Number(existingConversation.ad.price),
          },
        },
        'Conversation retrieved successfully',
        200
      );
      return;
    }

    // 4. Create new conversation in transaction (with optional initial message)
    const newConversation = await prisma.$transaction(async (tx) => {
      const conv = await tx.conversation.create({
        data: {
          adId,
          buyerId,
          sellerId: ad.userId,
        },
        include: {
          ad: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              currency: true,
              status: true,
              images: { orderBy: { order: 'asc' }, take: 1 },
            },
          },
          buyer: { select: { id: true, name: true, avatarUrl: true } },
          seller: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      const messages = [];
      if (initialMessage && initialMessage.trim()) {
        const msg = await tx.message.create({
          data: {
            conversationId: conv.id,
            senderId: buyerId,
            text: initialMessage.trim(),
          },
        });
        messages.push(msg);
      }

      const isBuyer = conv.buyerId === buyerId;
      const otherUser = isBuyer ? conv.seller : conv.buyer;

      return {
        ...conv,
        ad: {
          ...conv.ad,
          price: Number(conv.ad.price),
        },
        messages,
        lastMessage: messages[0] || null,
        otherUser,
        unreadCount: 0,
      };
    });

    sendSuccess(
      res,
      newConversation,
      'Conversation created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve user's conversation threads with unread count and latest message
 * GET /api/v1/chat/conversations
 */
export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', undefined, 401);
      return;
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { buyerId: userId },
        { sellerId: userId },
      ],
    };

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          ad: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              currency: true,
              status: true,
              images: { orderBy: { order: 'asc' }, take: 1 },
            },
          },
          buyer: { select: { id: true, name: true, avatarUrl: true } },
          seller: { select: { id: true, name: true, avatarUrl: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    // Compute unread counts for fetched conversations
    const conversationIds = conversations.map((c) => c.id);
    let unreadMap = new Map<string, number>();

    if (conversationIds.length > 0) {
      const unreadCounts = await prisma.message.groupBy({
        by: ['conversationId'],
        where: {
          conversationId: { in: conversationIds },
          senderId: { not: userId },
          isRead: false,
        },
        _count: { id: true },
      });

      unreadMap = new Map(
        unreadCounts.map((item) => [item.conversationId, item._count.id])
      );
    }

    const formattedConversations = conversations.map((conv) => {
      const isBuyer = conv.buyerId === userId;
      const otherUser = isBuyer ? conv.seller : conv.buyer;
      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        adId: conv.adId,
        ad: {
          ...conv.ad,
          price: Number(conv.ad.price),
        },
        buyerId: conv.buyerId,
        sellerId: conv.sellerId,
        buyer: conv.buyer,
        seller: conv.seller,
        otherUser,
        lastMessage,
        unreadCount: unreadMap.get(conv.id) || 0,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    sendSuccess(
      res,
      { conversations: formattedConversations },
      'Conversations retrieved successfully',
      200,
      { pagination }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve paginated message history for a conversation
 * GET /api/v1/chat/conversations/:id/messages
 */
export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', undefined, 401);
      return;
    }

    const { id: conversationId } = req.params;

    // Verify conversation existence and participant access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
      },
    });

    if (!conversation) {
      sendError(
        res,
        'CONVERSATION_NOT_FOUND',
        'Conversation not found',
        undefined,
        404
      );
      return;
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      sendError(
        res,
        'FORBIDDEN',
        'You do not have permission to view messages in this conversation',
        undefined,
        403
      );
      return;
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '30'), 10)));
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    sendSuccess(
      res,
      { messages },
      'Messages retrieved successfully',
      200,
      { pagination }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve a single conversation thread by ID
 * GET /api/v1/chat/conversations/:id
 */
export const getConversationById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', undefined, 401);
      return;
    }

    const { id } = req.params;

    const conv = await prisma.conversation.findUnique({
      where: { id },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            currency: true,
            status: true,
            images: { orderBy: { order: 'asc' }, take: 1 },
          },
        },
        buyer: { select: { id: true, name: true, avatarUrl: true } },
        seller: { select: { id: true, name: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!conv) {
      sendError(
        res,
        'CONVERSATION_NOT_FOUND',
        'Conversation not found',
        undefined,
        404
      );
      return;
    }

    if (conv.buyerId !== userId && conv.sellerId !== userId && req.user?.role !== 'ADMIN') {
      sendError(
        res,
        'FORBIDDEN',
        'You do not have permission to view this conversation',
        undefined,
        403
      );
      return;
    }

    const isBuyer = conv.buyerId === userId;
    const otherUser = isBuyer ? conv.seller : conv.buyer;

    const formattedConversation = {
      id: conv.id,
      adId: conv.adId,
      ad: {
        ...conv.ad,
        price: Number(conv.ad.price),
      },
      buyerId: conv.buyerId,
      sellerId: conv.sellerId,
      buyer: conv.buyer,
      seller: conv.seller,
      otherUser,
      lastMessage: conv.messages[0] || null,
      unreadCount: 0,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    };

    sendSuccess(
      res,
      formattedConversation,
      'Conversation retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};
