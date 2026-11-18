import { Router } from 'express';
import {
  createConversation,
  getConversations,
  getConversationById,
  getMessages,
} from '../controllers/chatController';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  createConversationSchema,
  conversationIdParamSchema,
  conversationListQuerySchema,
  messageHistoryQuerySchema,
} from '../schemas/chatSchemas';

const router = Router();

// Protect all chat routes with authentication
router.use(authenticateUser);

/**
 * @route   POST /api/v1/chat/conversations
 * @desc    Start a new conversation or retrieve existing thread for an ad
 * @access  Protected (Requires Bearer token)
 */
router.post(
  '/conversations',
  validateRequest({ body: createConversationSchema }),
  createConversation
);

/**
 * @route   GET /api/v1/chat/conversations
 * @desc    Retrieve conversations list for the authenticated user
 * @access  Protected (Requires Bearer token)
 */
router.get(
  '/conversations',
  validateRequest({ query: conversationListQuerySchema }),
  getConversations
);

/**
 * @route   GET /api/v1/chat/conversations/:id
 * @desc    Retrieve a single conversation thread by ID
 * @access  Protected (Requires Bearer token)
 */
router.get(
  '/conversations/:id',
  validateRequest({ params: conversationIdParamSchema }),
  getConversationById
);

/**
 * @route   GET /api/v1/chat/conversations/:id/messages
 * @desc    Retrieve paginated messages for a conversation
 * @access  Protected (Requires Bearer token)
 */
router.get(
  '/conversations/:id/messages',
  validateRequest({
    params: conversationIdParamSchema,
    query: messageHistoryQuerySchema,
  }),
  getMessages
);

export default router;
