# 🎵 Sync Up - AI-Powered Music Collaboration Platform

**Solo to Symphony** - Connect with talented musicians through intelligent matching.

Sync Up is a modern web application that helps musicians in NYC find perfect collaborators using AI-powered natural language search. Whether you're looking for a jazz pianist in Brooklyn or a drummer for your indie rock band, our intelligent matching system understands your needs and connects you with compatible musicians.

## ✨ Features

### 🤖 AI-Powered Search
- **Natural Language Processing**: Describe what you're looking for in plain English
- **Smart Query Parsing**: Automatically extracts instruments, genres, locations, and collaboration preferences
- **Compatibility Scoring**: Advanced algorithm ranks musicians by compatibility
- **Fallback Parsing**: Robust system that works even when AI service is unavailable

### 🎯 Intelligent Matching
- **Multi-factor Compatibility**: Considers instruments, genres, location, experience level, and availability
- **Location Awareness**: NYC-focused with neighborhood-specific matching
- **Musical Influences**: Matches based on artistic influences and styles
- **Collaboration Types**: Band formation, session work, jamming, duo collaboration

### 🚀 Modern Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: SQLite (development), PostgreSQL ready
- **AI Integration**: OpenAI API with custom fallback parsing
- **Real-time Features**: Debounced search, caching, error handling

### 🎨 Beautiful UI/UX
- **Responsive Design**: Works seamlessly on all devices
- **Glassmorphism**: Modern aesthetic with blur effects and gradients
- **Interactive Elements**: Smooth animations and hover effects
- **Professional Avatars**: Unsplash integration for musician photos
- **Error Boundaries**: Graceful error handling throughout the app

## 🏗️ Architecture

```
sync-up-experiment/
├── frontend/          # Next.js React application
├── backend/           # Express.js API with database
├── ml-service/        # Python Flask ML/AI service (optional)
├── deploy.sh          # Deployment script
├── demo.sh           # Interactive demo
└── README.md         # This file
```

### Port Configuration
- **Frontend**: http://localhost:3000 (Next.js development server)
- **Backend API**: http://localhost:3001 (Express.js + Prisma + SQLite)
- **ML Service**: http://localhost:5000 (Flask + OpenAI + spaCy - optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sync-up-experiment
   ```

2. **Run the deployment script**
   ```bash
   ./deploy.sh
   ```
   This will install dependencies, build both frontend and backend, and set up the database.

3. **Start the application**

   **Backend (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Visit the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/api/health

## 🎬 Demo

Run the interactive demo to see AI search capabilities:

```bash
./demo.sh
```

This will showcase various natural language queries and demonstrate the AI parsing and matching features.

### Sample Queries to Try:
- "find a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse"
- "looking for a bass player in williamsburg for session work, preferably someone who sounds like flea"
- "drummer needed for indie rock band in lower east side, must be available 3 times a week"
- "seeking a jazz pianist in manhattan for duo collaboration with evening rehearsals"

## 🏗️ Frontend Structure
```
frontend/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── page.tsx        # Main search page
│   │   ├── profile/        # Profile pages
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable components
│   ├── hooks/              # Custom React hooks
│   │   └── useSearch.ts    # Search functionality
│   ├── lib/                # Utilities and API client
│   ├── data/               # Demo data and types
│   └── types/              # TypeScript definitions
```

### Backend Structure
```
backend/
├── src/
│   ├── routes/             # API endpoints
│   │   ├── ai-search.ts   # AI-powered search
│   │   ├── search.ts      # Basic search
│   │   └── users.ts       # User management
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utilities
│   └── index.ts           # Server entry point
├── prisma/                 # Database schema and migrations
└── dist/                  # Compiled JavaScript
```

## 🛠️ Development

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_ENABLE_CACHING=true
NEXT_PUBLIC_CACHE_TTL=300000
NEXT_PUBLIC_DEBOUNCE_DELAY=300
```

**Backend (.env):**
```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
ML_SERVICE_URL=http://localhost:5000
CACHE_TTL=300
DATABASE_URL="file:./dev.db"
```

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run type-check` - Run TypeScript checks
- `npm run lint` - Run ESLint
- `npm run build:check` - Type check + lint + build

**Backend:**
- `npm run dev` - Start development server
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run db:push` - Push database schema
- `npm run db:seed` - Seed database with demo data
- `npm run type-check` - Run TypeScript checks

### Database Management

```bash
# Reset database and reseed
cd backend
npm run db:reset

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push
```

## 🔧 API Endpoints

### Search Endpoints
- `POST /api/ai-search` - AI-powered natural language search
- `GET /api/search` - Basic search with filters
- `GET /api/search/suggestions` - Get search suggestions

### User Endpoints
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Utility Endpoints
- `GET /api/health` - Health check
- `GET /api/ai-search/cache/stats` - Cache statistics
- `DELETE /api/ai-search/cache` - Clear cache

## 🧪 AI Search Features

### Natural Language Understanding
The AI search system can parse complex queries and extract:
- **Instruments**: guitar, bass, drums, vocals, piano, violin, etc.
- **Genres**: jazz, rock, pop, classical, electronic, hip-hop, etc.
- **Locations**: Brooklyn, Manhattan, Williamsburg, LES, etc.
- **Experience Levels**: beginner, intermediate, advanced, professional
- **Collaboration Types**: band formation, session work, jamming, duo
- **Availability**: weekends, evenings, weekly schedule requirements
- **Musical Influences**: Artist names and style references

### Compatibility Algorithm
Musicians are scored based on:
- **Instrument matching** (up to 25 points)
- **Genre compatibility** (up to 20 points)
- **Location proximity** (up to 20 points)
- **Experience level alignment** (up to 15 points)
- **Collaboration type match** (up to 15 points)
- **Availability overlap** (up to 10 points)

## 🚀 Production Deployment

### Build for Production
```bash
# Full production build
./deploy.sh

# Or manually:
cd backend && npm run production
cd frontend && npm run production
```

### Environment Setup
1. Configure production environment variables
2. Set up PostgreSQL database (replace SQLite)
3. Configure ML service endpoint
4. Set up proper CORS origins
5. Configure caching and rate limiting

### Performance Features
- **API Response Caching**: Configurable TTL-based caching
- **Request Debouncing**: Prevents excessive API calls
- **Error Boundaries**: Graceful error handling
- **Code Splitting**: Optimized bundle sizes
- **Image Optimization**: Next.js automatic optimization

## 🎯 Demo Data

The application includes 12 diverse NYC musicians with:
- Professional headshots from Unsplash
- Varied instruments (guitar, bass, drums, vocals, piano, violin, etc.)
- Different genres (jazz, rock, indie, electronic, classical, etc.)
- NYC locations (Brooklyn, Manhattan, Queens, etc.)
- Rich profiles with bios, influences, and equipment
- Realistic availability and collaboration preferences

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Musicians of NYC for inspiration
- Unsplash for professional musician photography
- OpenAI for natural language processing capabilities
- The open-source community for amazing tools and libraries

---

**Built with ❤️ for the NYC music community**

*From solo artists to full symphonies, Sync Up helps musicians find their perfect collaborators.*