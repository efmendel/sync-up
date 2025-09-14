# 🎵 Music Community Hackathon Database - Ready to Use!

A complete database setup for music collaboration apps with 120+ musician profiles, advanced search, and messaging system. **No external database setup required!**

## 🚀 **Quick Start (30 seconds)**

```bash
cd backend
npm run setup
npm run dev
```

**That's it!** Your database is ready with 120 musician profiles and full API.

## ✅ **What You Get**

### 📊 **Complete Database**
- **SQLite database** (no external setup needed)
- **120+ realistic musician profiles** with diverse instruments, genres, locations
- **Message system** for user communication
- **Prisma ORM** for type-safe database operations

### 🎸 **Rich Musician Data**
- **26 instrument types**: Guitar, Bass, Drums, Piano, Violin, Saxophone, etc.
- **30 music genres**: Rock, Jazz, Classical, Hip Hop, Electronic, etc.
- **50+ US locations**: NYC, LA, Nashville, Austin, Seattle, etc.
- **Realistic profiles**: Experience levels, availability, bios, collaboration types

### 📡 **Complete REST API**

#### **User Management**
- `GET /api/users` - List all users with filtering & pagination
- `GET /api/users/:id` - Get specific user profile
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

#### **Advanced Search**
- `GET /api/search` - Multi-field search (instruments, genres, location, etc.)
- `GET /api/search/suggestions` - Get search suggestions/autocomplete
- `GET /api/search/nearby` - Find musicians by location

#### **Messaging System**
- `GET /api/messages` - Get messages for user (sent/received)
- `POST /api/messages` - Send new message
- `GET /api/messages/:id` - Get specific message
- `PATCH /api/messages/:id/read` - Mark message as read
- `GET /api/messages/conversations/:userId` - Get conversation with user
- `GET /api/messages/unread/count` - Get unread message count

#### **System**
- `GET /api/health` - Health check and system status

## 🗄️ **Database Schema**

### **User Model**
```typescript
{
  id: string              // Unique identifier
  name: string           // Full name
  email: string          // Email (unique)
  instruments: string[]  // JSON array of instruments
  genres: string[]       // JSON array of genres
  location?: string      // City, State
  availability?: string  // "weekends", "evenings", etc.
  bio?: string          // Profile description
  experienceLevel: string // "beginner", "intermediate", "advanced", "professional"
  collaborationType: string // "band", "solo", "session", "teaching", "jamming"
  createdAt: DateTime
  updatedAt: DateTime
}
```

### **Message Model**
```typescript
{
  id: string
  subject?: string
  content: string
  senderId: string
  receiverId: string
  isRead: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 📋 **Sample API Calls**

### **Search for Guitarists in Nashville**
```bash
curl "http://localhost:3001/api/search?instruments=guitar&location=nashville"
```

### **Get All Jazz Musicians**
```bash
curl "http://localhost:3001/api/search?genres=jazz&limit=10"
```

### **Create New User**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "instruments": ["guitar", "vocals"],
    "genres": ["rock", "indie"],
    "location": "Brooklyn, NY",
    "availability": "weekends only",
    "bio": "Indie rock guitarist looking for band members",
    "experienceLevel": "intermediate",
    "collaborationType": "band"
  }'
```

### **Send Message**
```bash
curl -X POST "http://localhost:3001/api/messages?senderId=USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "RECIPIENT_ID",
    "subject": "Collaboration Inquiry",
    "content": "Hi! I saw your profile and would love to jam together."
  }'
```

## 🛠️ **Development Commands**

```bash
# Setup everything (one-time)
npm run setup

# Start development server
npm run dev

# Reset database with fresh data
npm run db:reset

# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Seed database manually
npm run seed

# Type checking
npm run type-check

# Build for production
npm run build
npm start
```

## 📁 **Project Structure**

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── routes/
│   │   ├── users.ts          # User CRUD operations
│   │   ├── search.ts         # Advanced search endpoints
│   │   ├── messages.ts       # Messaging system
│   │   └── health.ts         # Health check
│   ├── middleware/           # Error handling, validation
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Prisma client, utilities
│   ├── seed.ts              # Database seeding script
│   └── index.ts             # Express app setup
├── setup-database.sh        # One-command setup
└── dev.db                   # SQLite database (created automatically)
```

## 🎯 **Hackathon-Ready Features**

### ✅ **Instant Setup**
- No Docker, PostgreSQL, or complex database setup
- One command gets you running with data
- SQLite file-based database for simplicity

### ✅ **Rich Test Data**
- 120 diverse musician profiles
- Realistic names, locations, instruments, genres
- Ready for search and matching algorithms

### ✅ **Complete API**
- Full CRUD operations
- Advanced search with multiple filters
- Real-time messaging system
- Pagination, validation, error handling

### ✅ **Type Safety**
- Full TypeScript implementation
- Prisma for type-safe database queries
- Zod validation for API inputs

### ✅ **Production Ready**
- Error handling and validation
- Security middleware (Helmet, CORS)
- Logging with Morgan
- Environment configuration

## 🔧 **Customization**

### **Add More Sample Data**
Edit `src/seed.ts` and run:
```bash
npm run db:reset
```

### **Modify Database Schema**
1. Edit `prisma/schema.prisma`
2. Run `npm run db:push`
3. Update TypeScript types in `src/types/`

### **Add New API Endpoints**
1. Create new route file in `src/routes/`
2. Add to `src/index.ts`
3. Test with curl or Postman

## 📊 **Database Contents**

After setup, you'll have:
- **120 musician profiles** with realistic data
- **26 different instruments** represented
- **30 music genres** covered
- **50+ US locations** for geographic diversity
- **4 experience levels** (beginner to professional)
- **6 collaboration types** (band, solo, session, etc.)

## 🚀 **Ready for Production**

While optimized for hackathon speed, this setup includes:
- Proper error handling and validation
- Security best practices
- Scalable database schema
- Type-safe operations
- Comprehensive API documentation

**Perfect for building music collaboration apps, band finder tools, session musician platforms, and more!**

## 🎉 **You're Ready to Rock!**

Your music community database is live at `http://localhost:3001` with 120 musicians ready to connect. Build the next great music collaboration platform! 🎵