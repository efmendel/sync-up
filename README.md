# 🎵 Sync Up - AI-Powered Music Collaboration Search

An intelligent music collaboration platform that uses OpenAI GPT-4 and NYC-specific location intelligence to match musicians based on natural language queries.

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- OpenAI API key (optional - fallback mode available)

### Setup & Run

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sync-up
   ```

2. **Quick Setup** (Automated)
   ```bash
   cd ml-service
   python -m venv ml-env
   source ml-env/bin/activate  # On Windows: ml-env\Scripts\activate
   python setup.py  # Installs everything + downloads spaCy model
   ```

3. **Manual Setup** (If automated fails)
   ```bash
   cd ml-service
   python -m venv ml-env
   source ml-env/bin/activate
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

4. **Start the Service**
   ```bash
   # Development
   python app.py

   # Production
   gunicorn app:app --bind 0.0.0.0:5005
   ```

3. **Access the Demo**
   - Open `http://localhost:5005` in your browser
   - Try queries like: "find a female vocalist in brooklyn who rehearses twice a week"

### Optional: Database Backend

If you want to run the database API as well:

```bash
# In a new terminal
cd backend
npm install
npm run dev
```

This starts the database API on `http://localhost:3001` (currently not integrated with the ML search).

## 🎯 What's Working

- **🤖 AI Query Parsing**: OpenAI GPT-4 with spaCy fallback
- **🗺️ NYC Location Intelligence**: 65 neighborhoods with proximity scoring
- **👥 102 Musician Profiles**: Across all NYC boroughs
- **🔍 Smart Search**: Natural language to structured matching
- **📊 Compatibility Scoring**: 0-100% match ranking

## 🏗️ Architecture

```
Port 5005: Flask ML Service
├── Frontend (HTML + JavaScript)
├── API endpoints (/parse, /profiles, /match)
├── OpenAI + spaCy NLP processing
├── NYC location intelligence
└── Profile matching & scoring

Port 3001: Express Database API (Optional)
├── Prisma + SQLite
├── User management
└── Profile storage
```

## 📁 Key Files

- `ml-service/app.py` - Main Flask application
- `ml-service/static/music_search_frontend.html` - Frontend interface
- `ml-service/musician_profiles.json` - Profile database (102 NYC musicians)
- `ml-service/location_intelligence.py` - NYC neighborhood system
- `backend/` - Database API (separate service)

## 🧪 API Examples

```bash
# Parse natural language query
curl -X POST http://localhost:5005/parse \
  -H "Content-Type: application/json" \
  -d '{"query": "find a guitarist in brooklyn"}'

# Search profiles with location intelligence
curl "http://localhost:5005/profiles?location=lower%20east%20side&instrument=guitar"

# Test NYC location parsing
curl -X POST http://localhost:5005/locations/parse \
  -H "Content-Type: application/json" \
  -d '{"location": "williamsburg"}'
```

## 🎤 Demo Queries to Try

- "find a female vocalist in brooklyn who rehearses twice a week"
- "looking for a jazz pianist in manhattan for band formation"
- "need a drummer in williamsburg for recording sessions"
- "guitarist in lower east side who sounds like john mayer"

## 🔧 Environment Variables

```bash
# Optional - enables enhanced OpenAI parsing
OPENAI_API_KEY=your-api-key-here

# Without API key, system uses spaCy fallback parsing
```

## 📊 System Stats

- **65 NYC neighborhoods** with geographic relationships
- **115 location aliases** (LES, BK, LIC, etc.)
- **102 musician profiles** across all boroughs
- **Sub-millisecond** location parsing
- **No external APIs required** (besides optional OpenAI)

## 🚀 Deployment Ready

### **Cloud Platforms**
- **Heroku**: `git push heroku main` (add buildpacks: python)
- **Render**: Connect GitHub repo (auto-detects Python)
- **Railway**: One-click deploy from GitHub
- **DigitalOcean**: App Platform with Python runtime

### **Production Configuration**
```bash
# Use Gunicorn for production
gunicorn app:app --bind 0.0.0.0:$PORT --workers 2

# Environment variables needed:
OPENAI_API_KEY=your-key-here  # Optional
PORT=5005  # Or platform-provided port
```

### **Docker Deployment** (Optional)
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN python -m spacy download en_core_web_sm
COPY . .
EXPOSE 5005
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5005"]
```

---

**🏆 Hackathon-ready with 30-minute setup time!**
**☁️ Production-ready with 5-minute deployment!**