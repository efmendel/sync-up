import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import axios from 'axios';

const router = Router();

interface ParsedQuery {
  instruments?: string[];
  genres?: string[];
  location?: string;
  availability?: string;
  experience_level?: string;
  collaboration_intent?: string;
  gender?: string;
  musical_influences?: string[];
}

interface AIParseResponse {
  parsed_query: ParsedQuery;
  confidence: number;
  original_query: string;
}

// Cache for AI parsing results
const parseCache = new Map<string, { data: AIParseResponse; timestamp: number }>();
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300') * 1000;

async function parseQueryWithAI(query: string): Promise<AIParseResponse> {
  // Check cache first
  const cached = parseCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    const response = await axios.post(`${mlServiceUrl}/parse`, { query }, {
      timeout: 10000, // 10 second timeout
      headers: { 'Content-Type': 'application/json' }
    });

    const result: AIParseResponse = response.data;

    // Cache the result
    parseCache.set(query, { data: result, timestamp: Date.now() });

    return result;
  } catch (error: any) {
    console.warn('AI parsing failed, using fallback:', error.message);
    return fallbackParse(query);
  }
}

function fallbackParse(query: string): AIParseResponse {
  const queryLower = query.toLowerCase();
  const parsed: ParsedQuery = {};

  // Extract instruments
  const instruments = [];
  const instrumentMap = {
    'guitar': ['guitar', 'guitarist'],
    'bass': ['bass', 'bassist'],
    'drums': ['drums', 'drummer', 'percussion'],
    'vocals': ['vocals', 'vocalist', 'singer', 'vocal'],
    'piano': ['piano', 'pianist', 'keyboard'],
    'violin': ['violin', 'violinist'],
    'saxophone': ['saxophone', 'sax', 'saxophonist'],
    'trumpet': ['trumpet', 'trumpeter'],
    'cello': ['cello', 'cellist']
  };

  for (const [instrument, keywords] of Object.entries(instrumentMap)) {
    if (keywords.some(keyword => queryLower.includes(keyword))) {
      instruments.push(instrument);
    }
  }
  if (instruments.length > 0) parsed.instruments = instruments;

  // Extract genres
  const genres = [];
  const genreKeywords = ['jazz', 'rock', 'pop', 'classical', 'folk', 'blues', 'metal', 'indie', 'electronic', 'hip-hop', 'r&b', 'soul', 'funk'];
  for (const genre of genreKeywords) {
    if (queryLower.includes(genre)) {
      genres.push(genre);
    }
  }
  if (genres.length > 0) parsed.genres = genres;

  // Extract location
  const locations = ['brooklyn', 'manhattan', 'queens', 'bronx', 'williamsburg', 'astoria', 'harlem', 'soho'];
  for (const location of locations) {
    if (queryLower.includes(location)) {
      parsed.location = location;
      break;
    }
  }

  // Extract collaboration intent
  if (queryLower.includes('band') || queryLower.includes('group')) {
    parsed.collaboration_intent = 'band formation';
  } else if (queryLower.includes('session')) {
    parsed.collaboration_intent = 'session work';
  } else if (queryLower.includes('duo')) {
    parsed.collaboration_intent = 'duo collaboration';
  } else if (queryLower.includes('jam')) {
    parsed.collaboration_intent = 'jamming';
  }

  // Extract experience level
  if (queryLower.includes('professional') || queryLower.includes('pro')) {
    parsed.experience_level = 'professional';
  } else if (queryLower.includes('beginner')) {
    parsed.experience_level = 'beginner';
  } else if (queryLower.includes('intermediate')) {
    parsed.experience_level = 'intermediate';
  } else if (queryLower.includes('advanced')) {
    parsed.experience_level = 'advanced';
  }

  // Extract gender
  if (queryLower.includes('female') || queryLower.includes('woman')) {
    parsed.gender = 'female';
  } else if (queryLower.includes('male') || queryLower.includes('man')) {
    parsed.gender = 'male';
  }

  return {
    parsed_query: parsed,
    confidence: 0.7,
    original_query: query
  };
}

function calculateCompatibilityScore(user: any, parsedQuery: ParsedQuery): number {
  let score = 50; // Base score

  // Parse user's instruments and genres from JSON
  const userInstruments = JSON.parse(user.instruments || '[]');
  const userGenres = JSON.parse(user.genres || '[]');

  // Instrument matching (up to 25 points)
  if (parsedQuery.instruments && parsedQuery.instruments.length > 0) {
    const matchingInstruments = userInstruments.filter((inst: string) =>
      parsedQuery.instruments!.some((queryInst: string) =>
        inst.toLowerCase().includes(queryInst.toLowerCase()) ||
        queryInst.toLowerCase().includes(inst.toLowerCase())
      )
    );
    score += matchingInstruments.length * 8;
  }

  // Genre matching (up to 20 points)
  if (parsedQuery.genres && parsedQuery.genres.length > 0) {
    const matchingGenres = userGenres.filter((genre: string) =>
      parsedQuery.genres!.some((queryGenre: string) =>
        genre.toLowerCase().includes(queryGenre.toLowerCase())
      )
    );
    score += matchingGenres.length * 6;
  }

  // Location matching (up to 20 points)
  if (parsedQuery.location && user.location) {
    const userLocation = user.location.toLowerCase();
    const queryLocation = parsedQuery.location.toLowerCase();

    if (userLocation.includes(queryLocation)) {
      score += 20;
    } else if (queryLocation.includes('brooklyn') && userLocation.includes('brooklyn')) {
      score += 15;
    } else if (queryLocation.includes('manhattan') && userLocation.includes('manhattan')) {
      score += 15;
    }
  }

  // Experience level matching (up to 15 points)
  if (parsedQuery.experience_level && user.experienceLevel) {
    if (user.experienceLevel.toLowerCase() === parsedQuery.experience_level.toLowerCase()) {
      score += 15;
    } else {
      // Adjacent levels get partial points
      const levels = ['beginner', 'intermediate', 'advanced', 'professional'];
      const userLevelIndex = levels.indexOf(user.experienceLevel.toLowerCase());
      const queryLevelIndex = levels.indexOf(parsedQuery.experience_level.toLowerCase());
      const diff = Math.abs(userLevelIndex - queryLevelIndex);
      if (diff === 1) score += 8;
      else if (diff === 2) score += 4;
    }
  }

  // Collaboration type matching (up to 15 points)
  if (parsedQuery.collaboration_intent && user.collaborationType) {
    if (user.collaborationType.toLowerCase().includes(parsedQuery.collaboration_intent.toLowerCase())) {
      score += 15;
    }
  }

  // Availability matching (up to 10 points)
  if (parsedQuery.availability && user.availability) {
    if (user.availability.toLowerCase().includes(parsedQuery.availability.toLowerCase())) {
      score += 10;
    }
  }

  // Ensure deterministic scoring for consistent results
  return Math.min(Math.max(Math.round(score), 0), 100);
}

// POST /api/ai-search - AI-powered natural language search
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, page = 1, limit = 20 } = req.body;

    if (!query || typeof query !== 'string') {
      throw createError('Query parameter is required', 400);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), 100);

    // Parse query with AI
    const aiResult = await parseQueryWithAI(query);
    const { parsed_query: parsedQuery, confidence } = aiResult;

    // Note: Frontend now calls ML service directly, so we use backend fallback only

    // Build search conditions based on parsed query - more flexible approach
    const where: any = {};

    // If we have specific parsed conditions, use those for filtering
    // Otherwise, fall back to general text search
    const hasSpecificConditions = parsedQuery.location || parsedQuery.instruments || parsedQuery.genres;

    if (hasSpecificConditions) {
      // Use parsed conditions for more targeted search
      const conditions: any[] = [];

      // Location condition
      if (parsedQuery.location) {
        conditions.push({ location: { contains: parsedQuery.location } });
      }

      // Experience level condition
      if (parsedQuery.experience_level) {
        conditions.push({ experienceLevel: parsedQuery.experience_level });
      }

      // Collaboration type condition
      if (parsedQuery.collaboration_intent) {
        conditions.push({ collaborationType: { contains: parsedQuery.collaboration_intent } });
      }

      // If we have conditions, use OR to be more inclusive
      if (conditions.length > 0) {
        where.OR = conditions;
      }
    } else {
      // Fallback to general text search
      where.OR = [
        { name: { contains: query } },
        { bio: { contains: query } }
      ];
    }

    // Get ALL users from database to calculate compatibility scores
    const allUsers = await prisma.user.findMany({
      where
    });

    // Calculate compatibility scores for ALL users and sort by compatibility
    const allScoredUsers = allUsers
      .map((user: any) => ({
        ...user,
        instruments: JSON.parse(user.instruments || '[]'),
        genres: JSON.parse(user.genres || '[]'),
        compatibility_score: calculateCompatibilityScore(user, parsedQuery)
      }))
      .filter(user => user.compatibility_score >= 30) // Show matches with reasonable threshold
      .sort((a, b) => b.compatibility_score - a.compatibility_score);

    // Apply pagination AFTER sorting by compatibility
    const scoredUsers = allScoredUsers.slice(skip, skip + take);
    const total = allScoredUsers.length;

    res.json({
      users: scoredUsers,
      pagination: {
        page: Number(page),
        limit: take,
        total: total,
        totalPages: Math.ceil(total / take),
        hasNext: Number(page) < Math.ceil(total / take),
        hasPrev: Number(page) > 1
      },
      aiParsing: {
        original_query: query,
        parsed_query: parsedQuery,
        confidence,
        timestamp: new Date().toISOString()
      },
      searchQuery: {
        query,
        ...parsedQuery
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ai-search/parse - Parse query without searching
router.post('/parse', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      throw createError('Query parameter is required', 400);
    }

    const result = await parseQueryWithAI(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/ai-search/cache/stats - Get cache statistics
router.get('/cache/stats', (req: Request, res: Response) => {
  res.json({
    size: parseCache.size,
    ttl: CACHE_TTL,
    keys: Array.from(parseCache.keys())
  });
});

// DELETE /api/ai-search/cache - Clear cache
router.delete('/cache', (req: Request, res: Response) => {
  parseCache.clear();
  res.json({ message: 'Cache cleared successfully' });
});

export default router;