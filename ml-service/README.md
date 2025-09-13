# 🎵 Music Query Parser - OpenAI Powered

A hackathon-ready Flask API service that parses natural language music collaboration queries into structured JSON using OpenAI GPT-4 with spaCy fallback.

## ⚡ Quick Start (30 minutes to deploy)

```bash
cd ml-service
./deploy.sh
```

## 🚀 Features

- **OpenAI GPT-4 Integration** - Optimized prompts for music query parsing
- **spaCy Fallback** - Works offline when OpenAI is unavailable
- **Structured JSON Output** - Extracts instruments, gender, location, availability, influences, collaboration intent
- **Comprehensive Error Handling** - Validation and graceful degradation
- **Ready to Deploy** - Complete with setup scripts and testing

## 📋 API Endpoints

### POST /parse
Parse natural language music queries into structured JSON.

**Request:**
```json
{
  "query": "find a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse"
}
```

**Response:**
```json
{
  "instruments": ["vocals"],
  "gender": "female",
  "location": "Brooklyn",
  "availability": "rehearses twice a week",
  "musical_influences": ["Amy Winehouse"],
  "collaboration_intent": "band formation",
  "parsed_by": "openai",
  "confidence": "high",
  "timestamp": "2024-01-15T10:30:00",
  "original_query": "find a female vocalist in brooklyn..."
}
```

### GET /examples
Returns sample queries and expected outputs for testing.

### GET /health
Health check endpoint showing service status and available parsing methods.

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- OpenAI API key (optional, service works with spaCy fallback)

### Setup
1. Clone and navigate to ml-service directory
2. Run setup script: `python3 setup.py`
3. Add OpenAI API key to `.env` file
4. Start service: `python3 app.py`

## 📊 Testing

Run comprehensive tests:
```bash
python3 test_queries.py
```

## 🔧 Configuration

Environment variables in `.env`:
```
OPENAI_API_KEY=your_key_here
FLASK_ENV=development
HOST=0.0.0.0
PORT=5001
```

## 📝 Sample Queries

- "find a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse"
- "looking for a bass player in los angeles for session work, preferably someone who sounds like flea"
- "drummer needed for indie rock band, must be available 3 times a week, bonham style"
- "pianist seeking duo partner in nashville, jazz influenced, evening rehearsals"

## 🏗️ Architecture

- **Flask API** - RESTful endpoints
- **OpenAI GPT-4** - Primary parsing with optimized prompts
- **spaCy NLP** - Fallback parsing with named entity recognition
- **Error Handling** - Comprehensive validation and graceful failures
- **CORS Support** - Ready for frontend integration

## 🚦 Production Deployment

For production, use gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## 🤝 Integration

Perfect for music collaboration platforms, band finder apps, and session work matching services.

## 📈 Performance

- OpenAI parsing: ~2-3 seconds
- spaCy fallback: ~100ms
- Concurrent request support with gunicorn