from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
try:
    import spacy
    SPACY_AVAILABLE = True
except (ImportError, ValueError) as e:
    SPACY_AVAILABLE = False
    print(f"spaCy not available ({e}), using basic fallback only")
import os
import re
from typing import Dict, Any, Optional
import logging
from datetime import datetime
from optimized_matcher import OptimizedProfileMatcher
from location_intelligence import NYCLocationIntelligence

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MusicQueryParser:
    def __init__(self):
        self.openai_client = None
        self.nlp = None
        self.nyc_location_groups = self._build_nyc_location_groups()
        self.initialize_services()

    def initialize_services(self):
        """Initialize OpenAI and spaCy services"""
        try:
            openai.api_key = os.getenv('OPENAI_API_KEY')
            if openai.api_key:
                self.openai_client = openai
                logger.info("OpenAI client initialized successfully")
            else:
                logger.warning("OpenAI API key not found, fallback mode only")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI: {e}")

        if SPACY_AVAILABLE:
            try:
                self.nlp = spacy.load("en_core_web_sm")
                logger.info("spaCy model loaded successfully")
            except Exception as e:
                logger.warning(f"spaCy model not found: {e} - using basic parsing")
                self.nlp = None
        else:
            self.nlp = None
            logger.warning("spaCy not available - basic fallback parsing only")

    def _build_nyc_location_groups(self):
        """Build NYC location proximity groups for intelligent matching"""
        return {
            # Manhattan neighborhoods - very close
            "lower_manhattan": ["lower east side", "east village", "west village", "soho", "tribeca", "nolita", "chinatown", "little italy"],
            "midtown_manhattan": ["midtown", "times square", "hell's kitchen", "theater district", "garment district", "murray hill"],
            "upper_manhattan": ["upper east side", "upper west side", "harlem", "washington heights", "inwood"],

            # Brooklyn neighborhoods - close to Manhattan
            "north_brooklyn": ["williamsburg", "greenpoint", "dumbo", "brooklyn heights", "park slope", "fort greene"],
            "central_brooklyn": ["prospect heights", "crown heights", "bed-stuy", "clinton hill", "carroll gardens"],
            "south_brooklyn": ["red hook", "sunset park", "bay ridge", "bensonhurst", "coney island"],

            # Queens neighborhoods
            "west_queens": ["astoria", "long island city", "sunnyside", "woodside"],
            "central_queens": ["elmhurst", "jackson heights", "corona", "flushing"],
            "east_queens": ["forest hills", "kew gardens", "jamaica", "queens village"],

            # Bronx neighborhoods
            "south_bronx": ["mott haven", "melrose", "morrisania", "concourse"],
            "central_bronx": ["fordham", "tremont", "belmont", "morris heights"],
            "north_bronx": ["riverdale", "kingsbridge", "woodlawn", "wakefield"],

            # Staten Island
            "staten_island": ["st. george", "stapleton", "new brighton", "great kills", "tottenville"]
        }

    def get_location_similarity_score(self, query_location: str, profile_location: str) -> int:
        """Calculate location similarity score (higher = closer)"""
        query_loc = query_location.lower().strip()
        profile_loc = profile_location.lower().strip()

        # Exact match
        if query_loc in profile_loc or profile_loc in query_loc:
            return 100

        # Find which groups each location belongs to
        query_group = None
        profile_group = None

        for group_name, locations in self.nyc_location_groups.items():
            if any(loc in query_loc for loc in locations):
                query_group = group_name
            if any(loc in profile_loc for loc in locations):
                profile_group = group_name

        # Same neighborhood group (very close)
        if query_group and profile_group and query_group == profile_group:
            return 90

        # Manhattan to North Brooklyn (walking/short subway)
        if (query_group in ["lower_manhattan", "midtown_manhattan"] and profile_group == "north_brooklyn") or \
           (profile_group in ["lower_manhattan", "midtown_manhattan"] and query_group == "north_brooklyn"):
            return 80

        # Within same borough
        manhattan_groups = ["lower_manhattan", "midtown_manhattan", "upper_manhattan"]
        brooklyn_groups = ["north_brooklyn", "central_brooklyn", "south_brooklyn"]
        queens_groups = ["west_queens", "central_queens", "east_queens"]
        bronx_groups = ["south_bronx", "central_bronx", "north_bronx"]

        if (query_group in manhattan_groups and profile_group in manhattan_groups) or \
           (query_group in brooklyn_groups and profile_group in brooklyn_groups) or \
           (query_group in queens_groups and profile_group in queens_groups) or \
           (query_group in bronx_groups and profile_group in bronx_groups):
            return 70

        # Adjacent boroughs
        if (query_group in manhattan_groups and profile_group in brooklyn_groups) or \
           (profile_group in manhattan_groups and query_group in brooklyn_groups):
            return 60

        # Same city (NYC) but distant boroughs
        if query_group and profile_group:
            return 40

        # Generic city matches (NYC, New York, etc.)
        nyc_terms = ["new york", "nyc", "ny", "manhattan", "brooklyn", "queens", "bronx", "staten island"]
        if any(term in query_loc for term in nyc_terms) and any(term in profile_loc for term in nyc_terms):
            return 30

        # No match
        return 0

    def get_optimized_prompt(self, query: str) -> str:
        """Generate optimized prompt for music query parsing"""
        return f"""
You are a music collaboration query parser. Parse the following natural language query into structured JSON.

Query: "{query}"

Extract these fields with high accuracy:
- instruments: Array of instruments mentioned or implied
- gender: "male", "female", "any", or null if not specified
- location: City, state, or region mentioned
- availability: Rehearsal frequency, schedule preferences, or time commitments
- musical_influences: Artists, genres, or styles mentioned as influences or comparisons
- collaboration_intent: Type of collaboration sought (band formation, one-time gig, recording/studio work)

IMPORTANT RULES:
1. If a field is not mentioned or implied, return null
2. For instruments, include both explicitly mentioned and contextually implied ones:
   - "vocalist", "singer", "frontman", "frontwoman", "vocals" → ["vocals"]
   - "guitarist" → ["guitar"]
   - "bassist", "bass player" → ["bass"]
   - "drummer" → ["drums"]
   - "keyboardist", "pianist" → ["piano"]
3. For gender, look for pronouns, gendered terms, or explicit mentions:
   - "male", "man", "guy", "he", "him", "his", "frontman" → "male"
   - "female", "woman", "girl", "she", "her", "frontwoman" → "female"
4. For location, extract any geographic references (cities, states, countries)
5. For availability, capture time commitments, rehearsal schedules:
   - "twice a week", "once a week", "weekends only", "2-3 hours weekly"
6. For musical_influences, include artists used for comparison:
   - "like Amy Winehouse" → ["Amy Winehouse"]
   - "sounds like Flea" → ["Flea"]
   - "Bonham style" → ["Bonham"]
7. For collaboration_intent, infer from context and temporal patterns:
   - "band formation": "start a band", "form a group", "join a band", "long-term collaboration", "every week", "weekly", "every Monday", "regular", "ongoing", "monthly", "recurring commitments"
   - "one-time gig": "wedding gig", "fill in", "one night", "specific show", "this Saturday", "next week", "one event", "festival", "single performance", "temporary"
   - "recording/studio work": "recording", "studio work", "demo", "produce tracks", "mixing", "album", "EP", "session"

Return only valid JSON without any explanation:
"""

    def parse_with_openai(self, query: str) -> Optional[Dict[str, Any]]:
        """Parse query using OpenAI GPT-4"""
        if not self.openai_client:
            return None

        try:
            prompt = self.get_optimized_prompt(query)

            response = self.openai_client.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a precise music query parser. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.1
            )

            result_text = response.choices[0].message.content.strip()

            # Clean up response to ensure valid JSON
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]

            import json
            return json.loads(result_text.strip())

        except Exception as e:
            logger.error(f"OpenAI parsing failed: {e}")
            return None

    def parse_with_spacy(self, query: str) -> Dict[str, Any]:
        """Basic fallback parsing without spaCy"""
        result = {
            "instruments": [],
            "gender": None,
            "location": None,
            "availability": None,
            "musical_influences": [],
            "collaboration_intent": None
        }

        query_lower = query.lower()

        # Enhanced Instrument detection
        instruments = {
            "guitar": ["guitar", "guitarist", "axe", "shred", "riff", "six-string"],
            "bass": ["bass", "bassist", "four-string", "low-end", "rhythm section"],
            "drums": ["drums", "drummer", "percussion", "beat", "rhythm", "kit", "sticks"],
            "piano": ["piano", "pianist", "keys", "keyboard", "keyboardist", "ivories"],
            "vocals": ["vocals", "vocalist", "singer", "singing", "voice", "mic", "frontman", "frontwoman"],
            "violin": ["violin", "violinist", "fiddle", "strings"],
            "saxophone": ["saxophone", "sax", "saxophonist"],
            "trumpet": ["trumpet", "trumpeter", "horn"],
            "flute": ["flute", "flutist"],
            "cello": ["cello", "cellist"]
        }

        for instrument, synonyms in instruments.items():
            if any(synonym in query_lower for synonym in synonyms):
                if instrument == "vocals":
                    result["instruments"].append("vocals")
                else:
                    result["instruments"].append(instrument)

        # Enhanced Gender detection
        gender_keywords = {
            "female": ["female", "woman", "girl", "she", "her", "gal", "lady", "chick", "frontwoman"],
            "male": ["male", "man", "guy", "he", "him", "his", "dude", "bro", "gentleman", "frontman"]
        }

        for gender, keywords in gender_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                result["gender"] = gender
                break

        # Enhanced location detection - Cities, States, Countries
        locations = [
            # Major US Cities
            "brooklyn", "manhattan", "los angeles", "chicago", "nashville", "austin",
            "seattle", "portland", "denver", "atlanta", "boston", "miami", "dallas",
            "houston", "phoenix", "san francisco", "detroit", "philadelphia", "new york",
            "la", "nyc", "sf", "dc", "washington dc", "baltimore", "tampa", "orlando",
            "vegas", "las vegas", "san diego", "sacramento", "oakland", "minneapolis",
            "cleveland", "pittsburgh", "milwaukee", "kansas city", "new orleans",
            # US States
            "california", "new york state", "texas", "florida", "illinois", "pennsylvania",
            "ohio", "georgia", "north carolina", "michigan", "virginia", "washington state",
            "arizona", "massachusetts", "tennessee", "indiana", "missouri", "maryland",
            "wisconsin", "colorado", "minnesota", "south carolina", "alabama", "louisiana",
            # Countries
            "turkey", "england", "uk", "united kingdom", "canada", "australia", "germany",
            "france", "italy", "spain", "netherlands", "sweden", "norway", "denmark",
            "finland", "japan", "south korea", "brazil", "mexico", "argentina", "chile",
            "ireland", "scotland", "wales", "belgium", "switzerland", "austria", "poland",
            "czech republic", "hungary", "portugal", "greece", "russia", "india", "china",
            # Major International Cities
            "london", "paris", "berlin", "madrid", "rome", "amsterdam", "stockholm",
            "oslo", "copenhagen", "helsinki", "tokyo", "seoul", "sydney", "melbourne",
            "toronto", "vancouver", "montreal", "dublin", "edinburgh", "barcelona",
            "munich", "vienna", "prague", "budapest", "lisbon", "athens", "moscow",
            "mumbai", "delhi", "bangalore", "shanghai", "beijing", "hong kong", "singapore"
        ]

        # Sort by length (longest first) to match "Los Angeles" before "Angeles"
        locations.sort(key=len, reverse=True)
        for location in locations:
            if location in query_lower:
                # Clean up abbreviations
                if location == "la":
                    result["location"] = "Los Angeles"
                elif location == "nyc":
                    result["location"] = "New York"
                elif location == "sf":
                    result["location"] = "San Francisco"
                elif location == "dc":
                    result["location"] = "Washington DC"
                elif location == "vegas":
                    result["location"] = "Las Vegas"
                else:
                    result["location"] = location.title()
                break

        # Enhanced Availability detection
        availability_patterns = [
            (r"weekends?\s+only", "weekends only"),
            (r"twice\s+a\s+week", "twice a week"),
            (r"once\s+a\s+week", "once a week"),
            (r"thrice\s+a\s+week", "thrice a week"),
            (r"(\w+)\s+times?\s+a\s+week", lambda m: f"{m.group(1)} times a week"),
            (r"(\w+)\s+times?\s+weekly", lambda m: f"{m.group(1)} times weekly"),
            (r"rehearse\s+(\w+)\s+times?", lambda m: f"rehearses {m.group(1)} times"),
            (r"(\d+)-?(\d+)?\s+hours?\s+(weekly|per\s+week)", lambda m: f"{m.group(1)}-{m.group(2) or m.group(1)} hours weekly" if m.group(2) else f"{m.group(1)} hours weekly"),
            (r"(\d+)\s+hours?\s+a\s+week", lambda m: f"{m.group(1)} hours a week"),
            (r"evenings?\s+only", "evenings only"),
            (r"weekday\s+evenings?", "weekday evenings"),
            (r"full.?time", "full-time"),
            (r"part.?time", "part-time"),
            (r"flexible\s+schedule", "flexible schedule"),
            (r"commit\s+(\d+)-?(\d+)?\s+hours", lambda m: f"can commit {m.group(1)}-{m.group(2)} hours" if m.group(2) else f"can commit {m.group(1)} hours")
        ]

        for pattern, replacement in availability_patterns:
            match = re.search(pattern, query_lower)
            if match:
                if callable(replacement):
                    result["availability"] = replacement(match)
                else:
                    result["availability"] = replacement
                break

        # Enhanced Musical influences detection - capture full names better
        influence_patterns = [
            r"like\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)",  # Captures "Michael Jackson", "Amy Winehouse"
            r"like\s+([a-zA-Z]{3,}(?:\s+[a-zA-Z]{3,})*)",      # Backup pattern for names
            r"plays?\s+like\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)",  # "plays like Flea"
            r"plays?\s+like\s+([a-zA-Z]{3,}(?:\s+[a-zA-Z]{3,})*)",
            r"sounds?\s+like\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)",
            r"sounds?\s+like\s+([a-zA-Z]{3,}(?:\s+[a-zA-Z]{3,})*)",
            r"similar\s+to\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)",
            r"similar\s+to\s+([a-zA-Z]{3,}(?:\s+[a-zA-Z]{3,})*)",
            r"in\s+the\s+style\s+of\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)",
            r"in\s+the\s+style\s+of\s+([a-zA-Z]{3,}(?:\s+[a-zA-Z]{3,})*)",
            r"reminiscent\s+of\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)",
            r"reminiscent\s+of\s+([a-zA-Z]{3,}(?:\s+[a-zA-Z]{3,})*)",
            r"channeling\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)",
            r"channeling\s+([a-zA-Z]{3,}(?:\s+[a-zA-Z]{3,})*)",
            r"can\s+shred\s+like\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)",
            r"can\s+shred\s+like\s+([a-zA-Z]{3,}(?:\s+[a-zA-Z]{3,})*)",
            r"(\w+)\s+style"  # Simple style patterns like "bonham style"
        ]

        # Common stop words that shouldn't be artist names
        stop_words = {
            "the", "and", "for", "who", "can", "that", "with", "from", "they", "this",
            "have", "been", "were", "said", "each", "which", "their", "time", "will",
            "about", "would", "there", "could", "other", "more", "very", "what", "know",
            "just", "first", "also", "after", "back", "good", "well", "way", "even",
            "new", "want", "because", "any", "these", "give", "day", "most", "us"
        }

        for pattern in influence_patterns:
            matches = re.findall(pattern, query, re.IGNORECASE)
            for match in matches:
                clean_match = match.strip()
                # Filter out short matches and stop words
                words = clean_match.lower().split()
                if (len(clean_match) > 2 and
                    not any(word in stop_words for word in words) and
                    len([w for w in words if len(w) > 2]) >= 1):  # At least one substantial word
                    result["musical_influences"].append(clean_match.title())

        # Enhanced Collaboration intent detection
        collaboration_patterns = [
            (["band", "group", "bandmate", "member"], "band formation"),
            (["session", "gig", "recording", "studio work", "hired gun"], "session work"),
            (["duo", "pair", "partner", "acoustic duo"], "duo collaboration"),
            (["project", "musical project", "prog rock project", "side project"], "project collaboration"),
            (["jam", "jamming", "jam session"], "jamming"),
            (["teach", "teaching", "lessons", "instructor"], "teaching"),
            (["cover band", "tribute"], "cover band"),
            (["original", "originals", "songwriting"], "original music")
        ]

        for keywords, intent in collaboration_patterns:
            if any(keyword in query_lower for keyword in keywords):
                result["collaboration_intent"] = intent
                break

        # Clean up empty lists and remove duplicates
        result["instruments"] = list(set(result["instruments"])) if result["instruments"] else None
        result["musical_influences"] = list(set(result["musical_influences"])) if result["musical_influences"] else None

        return result

    def get_default_response(self) -> Dict[str, Any]:
        """Default response when all parsing fails"""
        return {
            "instruments": None,
            "gender": None,
            "location": None,
            "availability": None,
            "musical_influences": None,
            "collaboration_intent": None,
            "error": "Unable to parse query - services unavailable"
        }

    def parse_query(self, query: str) -> Dict[str, Any]:
        """Main parsing method with fallback logic"""
        if not query or not query.strip():
            return {"error": "Empty query provided"}

        # Try OpenAI first
        result = self.parse_with_openai(query)

        if result:
            result["parsed_by"] = "openai"
            result["confidence"] = "high"
        else:
            # Fallback to spaCy
            result = self.parse_with_spacy(query)
            result["parsed_by"] = "spacy"
            result["confidence"] = "medium"

        result["timestamp"] = datetime.now().isoformat()
        result["original_query"] = query

        return result

# Initialize services
parser = MusicQueryParser()
matcher = OptimizedProfileMatcher("musician_profiles.json")
location_intel = NYCLocationIntelligence()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "services": {
            "openai": parser.openai_client is not None,
            "spacy": parser.nlp is not None,
            "profile_matcher": len(matcher.profiles) > 0
        },
        "profile_count": len(matcher.profiles)
    })

@app.route('/parse', methods=['POST'])
def parse_music_query():
    """Main endpoint for parsing music queries"""
    try:
        data = request.get_json()

        if not data or 'query' not in data:
            return jsonify({"error": "Missing 'query' field in request"}), 400

        query = data['query']

        if not isinstance(query, str) or len(query.strip()) == 0:
            return jsonify({"error": "Query must be a non-empty string"}), 400

        if len(query) > 1000:
            return jsonify({"error": "Query too long (max 1000 characters)"}), 400

        result = parser.parse_query(query)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/examples', methods=['GET'])
def get_examples():
    """Endpoint returning sample queries and expected outputs"""
    examples = [
        {
            "query": "find a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse",
            "expected_output": {
                "instruments": ["vocals"],
                "gender": "female",
                "location": "Brooklyn",
                "availability": "rehearses twice a week",
                "musical_influences": ["Amy Winehouse"],
                "collaboration_intent": "band formation"
            }
        },
        {
            "query": "looking for a bass player in los angeles for session work, preferably someone who sounds like flea",
            "expected_output": {
                "instruments": ["bass"],
                "gender": None,
                "location": "Los Angeles",
                "availability": None,
                "musical_influences": ["Flea"],
                "collaboration_intent": "recording/studio work"
            }
        },
        {
            "query": "drummer needed for indie rock band, must be available 3 times a week, bonham style",
            "expected_output": {
                "instruments": ["drums"],
                "gender": None,
                "location": None,
                "availability": "3 times a week",
                "musical_influences": ["Bonham"],
                "collaboration_intent": "band formation"
            }
        },
        {
            "query": "pianist seeking duo partner in nashville, jazz influenced, evening rehearsals",
            "expected_output": {
                "instruments": ["piano"],
                "gender": None,
                "location": "Nashville",
                "availability": "evening rehearsals",
                "musical_influences": ["jazz"],
                "collaboration_intent": "band formation"
            }
        }
    ]

    return jsonify({"examples": examples})

@app.route('/match', methods=['POST'])
def find_matches():
    """Find matching musician profiles based on parsed query"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        # Check if we have a raw query to parse first
        if 'query' in data and isinstance(data['query'], str):
            # Parse the natural language query first
            parsed_query = parser.parse_query(data['query'])
            if 'error' in parsed_query:
                return jsonify({"error": f"Query parsing failed: {parsed_query['error']}"}), 400
        else:
            # Use provided structured query
            parsed_query = data

        # Extract matching parameters
        min_compatibility = data.get('min_compatibility', 0.7)
        max_results = data.get('max_results', 20)

        # Validate min_compatibility
        if not isinstance(min_compatibility, (int, float)) or min_compatibility < 0 or min_compatibility > 1:
            return jsonify({"error": "min_compatibility must be a number between 0 and 1"}), 400

        # Validate max_results
        if not isinstance(max_results, int) or max_results < 1 or max_results > 100:
            return jsonify({"error": "max_results must be an integer between 1 and 100"}), 400

        # Find matches using the profile matcher
        results = matcher.find_matches(
            parsed_query,
            min_compatibility=min_compatibility,
            max_results=max_results
        )

        # Add the original parsed query to results
        results["parsed_query"] = parsed_query

        return jsonify(results)

    except Exception as e:
        logger.error(f"Error finding matches: {e}")
        return jsonify({"error": "Internal server error during matching"}), 500

@app.route('/match/quick', methods=['POST'])
def quick_match():
    """Quick match endpoint that parses query and finds matches in one call"""
    try:
        data = request.get_json()

        if not data or 'query' not in data:
            return jsonify({"error": "Missing 'query' field in request"}), 400

        query = data['query']
        if not isinstance(query, str) or len(query.strip()) == 0:
            return jsonify({"error": "Query must be a non-empty string"}), 400

        if len(query) > 1000:
            return jsonify({"error": "Query too long (max 1000 characters)"}), 400

        # Parse the natural language query
        start_time = datetime.now()
        parsed_query = parser.parse_query(query)

        if 'error' in parsed_query:
            return jsonify({"error": f"Query parsing failed: {parsed_query['error']}"}), 400

        # Get matching parameters
        min_compatibility = data.get('min_compatibility', 0.7)
        max_results = data.get('max_results', 10)  # Fewer results for quick match

        # Find matches
        results = matcher.find_matches(
            parsed_query,
            min_compatibility=min_compatibility,
            max_results=max_results
        )

        # Calculate total processing time
        total_time = (datetime.now() - start_time).total_seconds() * 1000

        # Add comprehensive response
        response = {
            "matches": results["matches"],
            "total_found": results["total_found"],
            "parsed_query": parsed_query,
            "processing_time": {
                "parsing_ms": results.get("processing_time_ms", 0),
                "matching_ms": results.get("processing_time_ms", 0),
                "total_ms": round(total_time, 2)
            },
            "query_summary": results.get("query_summary", ""),
            "search_timestamp": results.get("search_timestamp", datetime.now().isoformat())
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"Error in quick match: {e}")
        return jsonify({"error": "Internal server error during quick match"}), 500

@app.route('/profiles', methods=['GET'])
def get_profiles():
    """Get all musician profiles with optional filtering"""
    try:
        # Get query parameters
        location = request.args.get('location')
        instrument = request.args.get('instrument')
        genre = request.args.get('genre')
        collaboration_intent = request.args.get('collaboration_intent')
        limit = request.args.get('limit', default=50, type=int)

        profiles = matcher.profiles.copy()

        # Calculate compatibility scores for ALL profiles
        for profile in profiles:
            score = 0

            # Location scoring (0-50 points)
            if location:
                location_score = location_intel.get_proximity_score(location, profile.get('location', ''))
                score += (location_score / 100) * 50

            # Instrument matching (0-25 points)
            if instrument:
                instrument_match = any(instrument.lower() in inst.lower() for inst in profile.get('instruments', []))
                if instrument_match:
                    score += 25
                else:
                    # Partial credit for related instruments
                    score += 5

            # Genre matching (0-15 points)
            if genre:
                genre_match = any(genre.lower() in g.lower() for g in profile.get('genres', []))
                if genre_match:
                    score += 15
                else:
                    # Partial credit for complementary genres
                    score += 3

            # Collaboration type matching (0-10 points)
            if collaboration_intent:
                collab_match = collaboration_intent.lower() in profile.get('collaboration_intent', '').lower()
                if collab_match:
                    score += 10
                else:
                    score += 2

            # If no criteria specified, give base score
            if not any([location, instrument, genre, collaboration_intent]):
                score = 50

            profile['_compatibility_score'] = score

        # Sort by compatibility score (highest first)
        profiles.sort(key=lambda p: p.get('_compatibility_score', 0), reverse=True)

        # Keep the compatibility score in the response for frontend display
        for profile in profiles:
            score = profile.pop('_compatibility_score', 0)
            profile['compatibility_score'] = round(score, 1)

        # Limit results
        profiles = profiles[:limit]

        return jsonify({
            "profiles": profiles,
            "total_count": len(profiles),
            "filters_applied": {
                "location": location,
                "instrument": instrument,
                "genre": genre,
                "collaboration_intent": collaboration_intent,
                "limit": limit
            }
        })

    except Exception as e:
        logger.error(f"Error getting profiles: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/profiles/<profile_id>', methods=['GET'])
def get_profile(profile_id):
    """Get a specific musician profile by ID"""
    try:
        profile = next((p for p in matcher.profiles if p['id'] == profile_id), None)

        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        return jsonify(profile)

    except Exception as e:
        logger.error(f"Error getting profile {profile_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/locations/parse', methods=['POST'])
def parse_location():
    """Parse location from natural language text"""
    try:
        data = request.get_json()
        if not data or 'location' not in data:
            return jsonify({"error": "Location text is required"}), 400

        location_text = data['location']
        parsed = location_intel.parse_location(location_text)

        if not parsed:
            return jsonify({
                "success": False,
                "message": "Could not parse location",
                "input": location_text
            })

        return jsonify({
            "success": True,
            "input": location_text,
            "parsed": parsed
        })

    except Exception as e:
        logger.error(f"Error parsing location: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/locations/nearby', methods=['GET'])
def get_nearby_locations():
    """Get nearby neighborhoods for a given location"""
    try:
        location = request.args.get('location')
        min_score = request.args.get('min_score', default=30, type=int)

        if not location:
            return jsonify({"error": "Location parameter is required"}), 400

        nearby = location_intel.get_nearby_neighborhoods(location, min_score)

        return jsonify({
            "query_location": location,
            "min_proximity_score": min_score,
            "nearby_neighborhoods": nearby,
            "total_found": len(nearby)
        })

    except Exception as e:
        logger.error(f"Error getting nearby locations: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/locations/proximity', methods=['POST'])
def calculate_proximity():
    """Calculate proximity score between two locations"""
    try:
        data = request.get_json()
        if not data or 'location1' not in data or 'location2' not in data:
            return jsonify({"error": "Both location1 and location2 are required"}), 400

        location1 = data['location1']
        location2 = data['location2']

        score = location_intel.get_proximity_score(location1, location2)
        parsed1 = location_intel.parse_location(location1)
        parsed2 = location_intel.parse_location(location2)

        # Get travel description
        travel_desc = "Unknown"
        if score >= 90:
            travel_desc = "Same area - walking distance"
        elif score >= 80:
            travel_desc = "Very close - short subway ride"
        elif score >= 70:
            travel_desc = "Close - same borough or adjacent"
        elif score >= 50:
            travel_desc = "Moderate - cross-borough commute"
        elif score >= 30:
            travel_desc = "Distant - longer commute required"
        else:
            travel_desc = "Very distant - significant travel time"

        return jsonify({
            "location1": location1,
            "location2": location2,
            "proximity_score": score,
            "travel_description": travel_desc,
            "parsed_locations": {
                "location1": parsed1,
                "location2": parsed2
            }
        })

    except Exception as e:
        logger.error(f"Error calculating proximity: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/locations/stats', methods=['GET'])
def get_location_stats():
    """Get statistics about the location intelligence system"""
    try:
        stats = location_intel.get_location_stats()

        return jsonify({
            "system_info": "NYC Location Intelligence System",
            "version": "1.0.0",
            "statistics": stats,
            "features": [
                "Natural language location parsing",
                "Neighborhood proximity scoring",
                "Borough-aware distance calculation",
                "NYC-specific location intelligence",
                "No external API dependencies"
            ]
        })

    except Exception as e:
        logger.error(f"Error getting location stats: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/locations/examples', methods=['GET'])
def get_location_examples():
    """Get example location queries and results"""
    try:
        examples = [
            {
                "input": "lower east side",
                "expected_type": "neighborhood",
                "expected_borough": "Manhattan",
                "nearby_areas": ["East Village", "West Village", "SoHo"]
            },
            {
                "input": "williamsburg",
                "expected_type": "neighborhood",
                "expected_borough": "Brooklyn",
                "nearby_areas": ["Greenpoint", "DUMBO", "Park Slope"]
            },
            {
                "input": "astoria",
                "expected_type": "neighborhood",
                "expected_borough": "Queens",
                "nearby_areas": ["Long Island City", "Sunnyside"]
            },
            {
                "input": "brooklyn",
                "expected_type": "borough",
                "expected_borough": "Brooklyn",
                "nearby_areas": ["All Brooklyn neighborhoods"]
            },
            {
                "input": "nyc",
                "expected_type": "city",
                "expected_borough": "All",
                "nearby_areas": ["All NYC neighborhoods"]
            }
        ]

        # Test each example
        for example in examples:
            parsed = location_intel.parse_location(example["input"])
            example["actual_result"] = parsed

        return jsonify({
            "description": "Sample location parsing examples",
            "examples": examples,
            "usage": {
                "parse": "POST /locations/parse with {'location': 'text'}",
                "nearby": "GET /locations/nearby?location=text&min_score=30",
                "proximity": "POST /locations/proximity with {'location1': 'text1', 'location2': 'text2'}"
            }
        })

    except Exception as e:
        logger.error(f"Error getting location examples: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5005)