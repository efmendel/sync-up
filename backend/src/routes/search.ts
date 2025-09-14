import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

const router = Router();

// GET /api/search - Advanced search for musicians
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      q, // General search query
      instruments,
      genres,
      location,
      availability,
      experienceLevel,
      collaborationType,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), 100); // Max 100 results

    // Build complex search query
    const where: any = {};
    const searchConditions: any[] = [];

    // General text search across name, bio
    if (q && typeof q === 'string') {
      searchConditions.push(
        { name: { contains: q } },
        { bio: { contains: q } }
      );
    }

    // Instrument search
    if (instruments && typeof instruments === 'string') {
      const instrumentList = instruments.split(',').map(i => i.trim());
      instrumentList.forEach(instrument => {
        searchConditions.push({
          instruments: { contains: instrument }
        });
      });
    }

    // Genre search
    if (genres && typeof genres === 'string') {
      const genreList = genres.split(',').map(g => g.trim());
      genreList.forEach(genre => {
        searchConditions.push({
          genres: { contains: genre }
        });
      });
    }

    // Location search
    if (location && typeof location === 'string') {
      where.location = {
        contains: location
      };
    }

    // Availability search
    if (availability && typeof availability === 'string') {
      where.availability = {
        contains: availability
      };
    }

    // Experience level filter
    if (experienceLevel && typeof experienceLevel === 'string') {
      where.experienceLevel = experienceLevel;
    }

    // Collaboration type filter
    if (collaborationType && typeof collaborationType === 'string') {
      where.collaborationType = collaborationType;
    }

    // Combine search conditions with OR
    if (searchConditions.length > 0) {
      where.OR = searchConditions;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: [
          { createdAt: 'desc' }
        ]
      }),
      prisma.user.count({ where })
    ]);

    // Format response
    const formattedUsers = users.map((user: any) => ({
      ...user,
      instruments: JSON.parse(user.instruments),
      genres: JSON.parse(user.genres)
    }));

    const totalPages = Math.ceil(total / take);

    res.json({
      users: formattedUsers,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      },
      searchQuery: {
        q,
        instruments,
        genres,
        location,
        availability,
        experienceLevel,
        collaborationType
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/search/suggestions - Get search suggestions
router.get('/suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type = 'all' } = req.query;

    const suggestions: any = {};

    if (type === 'all' || type === 'instruments') {
      // Get unique instruments from all users
      const users = await prisma.user.findMany({
        select: { instruments: true }
      });

      const allInstruments = new Set<string>();
      users.forEach((user: any) => {
        const userInstruments = JSON.parse(user.instruments);
        userInstruments.forEach((instrument: string) => allInstruments.add(instrument));
      });

      suggestions.instruments = Array.from(allInstruments).sort();
    }

    if (type === 'all' || type === 'genres') {
      // Get unique genres from all users
      const users = await prisma.user.findMany({
        select: { genres: true }
      });

      const allGenres = new Set<string>();
      users.forEach((user: any) => {
        const userGenres = JSON.parse(user.genres);
        userGenres.forEach((genre: string) => allGenres.add(genre));
      });

      suggestions.genres = Array.from(allGenres).sort();
    }

    if (type === 'all' || type === 'locations') {
      const locations = await prisma.user.findMany({
        select: { location: true },
        where: { location: { not: null } },
        distinct: ['location']
      });

      suggestions.locations = locations
        .map((l: any) => l.location)
        .filter(Boolean)
        .sort();
    }

    if (type === 'all' || type === 'experienceLevels') {
      const levels = await prisma.user.findMany({
        select: { experienceLevel: true },
        distinct: ['experienceLevel']
      });

      suggestions.experienceLevels = levels
        .map((l: any) => l.experienceLevel)
        .sort();
    }

    if (type === 'all' || type === 'collaborationTypes') {
      const types = await prisma.user.findMany({
        select: { collaborationType: true },
        distinct: ['collaborationType']
      });

      suggestions.collaborationTypes = types
        .map((t: any) => t.collaborationType)
        .sort();
    }

    res.json(suggestions);
  } catch (error) {
    next(error);
  }
});

// GET /api/search/nearby - Find users near a location
router.get('/nearby', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location, radius = 50, page = 1, limit = 20 } = req.query;

    if (!location || typeof location !== 'string') {
      throw createError('Location parameter is required', 400);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), 100);

    // Simple nearby search - in production, you'd use proper geolocation
    // For now, we'll do a fuzzy location match
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          location: {
            contains: location
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({
        where: {
          location: {
            contains: location
          }
        }
      })
    ]);

    const formattedUsers = users.map((user: any) => ({
      ...user,
      instruments: JSON.parse(user.instruments),
      genres: JSON.parse(user.genres)
    }));

    const totalPages = Math.ceil(total / take);

    res.json({
      users: formattedUsers,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      },
      searchQuery: {
        location,
        radius: Number(radius)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;