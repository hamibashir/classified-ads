import { z } from 'zod';

/**
 * Validation schema for initiating or retrieving a conversation
 */
export const createConversationSchema = z.object({
  adId: z.string().uuid('Invalid ad ID format'),
  initialMessage: z
    .string()
    .trim()
    .min(1, 'Initial message cannot be empty')
    .max(2000, 'Initial message cannot exceed 2000 characters')
    .optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

/**
 * Validation schema for conversation UUID parameter
 */
export const conversationIdParamSchema = z.object({
  id: z.string().uuid('Invalid conversation ID format'),
});

export type ConversationIdParam = z.infer<typeof conversationIdParamSchema>;

/**
 * Validation schema for listing user conversations
 */
export const conversationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ConversationListQuery = z.infer<typeof conversationListQuerySchema>;

/**
 * Validation schema for fetching paginated message history
 */
export const messageHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export type MessageHistoryQuery = z.infer<typeof messageHistoryQuerySchema>;
