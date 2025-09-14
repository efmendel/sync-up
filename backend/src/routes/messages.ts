import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

// Validation schemas
const CreateMessageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  subject: z.string().optional(),
  content: z.string().min(1, 'Message content is required').max(5000, 'Message too long')
});

const MessageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.enum(['sent', 'received', 'all']).default('all'),
  unreadOnly: z.coerce.boolean().default(false)
});

// GET /api/messages - Get messages for a user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      throw createError('User ID is required', 400);
    }

    const query = MessageQuerySchema.parse(req.query);
    const { page, limit, type, unreadOnly } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    let where: any = {};

    switch (type) {
      case 'sent':
        where.senderId = userId;
        break;
      case 'received':
        where.receiverId = userId;
        break;
      default:
        where = {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        };
    }

    // Filter for unread messages if requested
    if (unreadOnly) {
      where.isRead = false;
      where.receiverId = userId; // Only show unread received messages
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.message.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/:id - Get a specific message
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      throw createError('User ID is required', 400);
    }

    if (!id) {
      throw createError('Message ID is required', 400);
    }

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!message) {
      throw createError('Message not found', 404);
    }

    // Check if user has permission to view this message
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw createError('Access denied', 403);
    }

    // Mark as read if user is the receiver
    if (message.receiverId === userId && !message.isRead) {
      if (!id) {
        throw createError('Message ID is required', 400);
      }
      await prisma.message.update({
        where: { id },
        data: { isRead: true }
      });
      message.isRead = true;
    }

    res.json(message);
  } catch (error) {
    next(error);
  }
});

// POST /api/messages - Send a new message
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { senderId } = req.query;

    if (!senderId || typeof senderId !== 'string') {
      throw createError('Sender ID is required', 400);
    }

    const messageData = CreateMessageSchema.parse(req.body);

    // Check if sender exists
    const sender = await prisma.user.findUnique({
      where: { id: senderId }
    });

    if (!sender) {
      throw createError('Sender not found', 404);
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: messageData.receiverId }
    });

    if (!receiver) {
      throw createError('Receiver not found', 404);
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: messageData.receiverId,
        subject: messageData.subject || null,
        content: messageData.content
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/messages/:id/read - Mark message as read
router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      throw createError('User ID is required', 400);
    }

    if (!id) {
      throw createError('Message ID is required', 400);
    }

    // Check if message exists and user is the receiver
    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      throw createError('Message not found', 404);
    }

    if (message.receiverId !== userId) {
      throw createError('Only the receiver can mark messages as read', 403);
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { isRead: true },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(updatedMessage);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      throw createError('User ID is required', 400);
    }

    if (!id) {
      throw createError('Message ID is required', 400);
    }

    // Check if message exists
    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      throw createError('Message not found', 404);
    }

    // Only sender or receiver can delete
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw createError('Access denied', 403);
    }

    await prisma.message.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/conversations/:userId - Get conversation with specific user
router.get('/conversations/:otherUserId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { otherUserId } = req.params;
    const { userId, page = 1, limit = 20 } = req.query;

    if (!userId || typeof userId !== 'string') {
      throw createError('User ID is required', 400);
    }

    if (!otherUserId) {
      throw createError('Other User ID is required', 400);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), 100);

    // Get messages between the two users
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
          ]
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
          ]
        }
      })
    ]);

    // Mark received messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    const totalPages = Math.ceil(total / take);

    res.json({
      messages,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      },
      otherUser: null  // We'll fetch this separately if needed
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/unread/count - Get unread message count
router.get('/unread/count', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      throw createError('User ID is required', 400);
    }

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    next(error);
  }
});

export default router;