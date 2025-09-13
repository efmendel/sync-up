import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { CreateUserSchema, UpdateUserSchema, UserQuerySchema, CreateUserInput, UpdateUserInput } from '../types/user';
import { createError } from '../middleware/errorHandler';

const router = Router();

// GET /api/users - Get all users with filtering and pagination
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = UserQuerySchema.parse(req.query);
    const { page, limit, instruments, genres, location, experienceLevel, collaborationType } = query;

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (instruments) {
      where.instruments = { contains: instruments };
    }

    if (genres) {
      where.genres = { contains: genres };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (collaborationType) {
      where.collaborationType = collaborationType;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    // Parse JSON strings back to arrays
    const formattedUsers = users.map(user => ({
      ...user,
      instruments: JSON.parse(user.instruments),
      genres: JSON.parse(user.genres)
    }));

    const totalPages = Math.ceil(total / limit);

    res.json({
      users: formattedUsers,
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

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: id as string }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const formattedUser = {
      ...user,
      instruments: JSON.parse(user.instruments),
      genres: JSON.parse(user.genres)
    };

    res.json(formattedUser);
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create new user
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData: CreateUserInput = CreateUserSchema.parse(req.body);

    const user = await prisma.user.create({
      data: {
        ...userData,
        instruments: JSON.stringify(userData.instruments),
        genres: JSON.stringify(userData.genres),
        location: userData.location ?? null,
        availability: userData.availability ?? null,
        bio: userData.bio ?? null
      }
    });

    const formattedUser = {
      ...user,
      instruments: JSON.parse(user.instruments),
      genres: JSON.parse(user.genres)
    };

    res.status(201).json(formattedUser);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userData: UpdateUserInput = UpdateUserSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: id as string }
    });

    if (!existingUser) {
      throw createError('User not found', 404);
    }

    const updateData: any = { ...userData };

    if (userData.instruments) {
      updateData.instruments = JSON.stringify(userData.instruments);
    }

    if (userData.genres) {
      updateData.genres = JSON.stringify(userData.genres);
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: updateData
    });

    const formattedUser = {
      ...user,
      instruments: JSON.parse(user.instruments),
      genres: JSON.parse(user.genres)
    };

    res.json(formattedUser);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: id as string }
    });

    if (!existingUser) {
      throw createError('User not found', 404);
    }

    await prisma.user.delete({
      where: { id: id as string }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;