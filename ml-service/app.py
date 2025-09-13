from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import spacy
import os
import re
from typing import Dict, Any, Optional
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MusicQueryParser:
    def __init__(self):
        self.openai_client = None
        self.nlp = None
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

        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load spaCy model: {e}")

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
- collaboration_intent: Type of collaboration sought (band, duo, session work, etc.)

Rules:
1. If a field is not mentioned or implied, return null
2. For instruments, include both explicitly mentioned and contextually implied ones
3. For gender, look for pronouns, gendered terms, or explicit mentions
4. For location, extract any geographic references
5. For availability, capture time commitments, rehearsal schedules
6. For musical_influences, include artists used for comparison ("like Amy Winehouse")
7. For collaboration_intent, infer from context (seeking bandmates, session work, etc.)

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
        """Fallback parsing using spaCy NLP"""
        if not self.nlp:
            return self.get_default_response()

        doc = self.nlp(query.lower())

        result = {
            "instruments": [],
            "gender": None,
            "location": None,
            "availability": None,
            "musical_influences": [],
            "collaboration_intent": None
        }

        # Instrument detection
        instruments = [
            "guitar", "bass", "drums", "piano", "keyboard", "violin", "vocals",
            "singing", "voice", "trumpet", "saxophone", "flute", "cello"
        ]
        for token in doc:
            if token.text in instruments:
                if token.text in ["vocals", "singing", "voice"]:
                    result["instruments"].append("vocals")
                else:
                    result["instruments"].append(token.text)

        # Gender detection
        gender_keywords = {
            "female": ["female", "woman", "girl", "she", "her"],
            "male": ["male", "man", "guy", "he", "him", "his"]
        }

        for gender, keywords in gender_keywords.items():
            if any(keyword in query.lower() for keyword in keywords):
                result["gender"] = gender
                break

        # Location detection (using named entities)
        locations = [ent.text for ent in doc.ents if ent.label_ in ["GPE", "LOC"]]
        if locations:
            result["location"] = locations[0].title()

        # Availability detection
        availability_patterns = [
            r"(\w+)\s+times?\s+a\s+week",
            r"rehearse\s+(\w+)\s+times?",
            r"(\d+)\s+hours?\s+a\s+week"
        ]

        for pattern in availability_patterns:
            match = re.search(pattern, query.lower())
            if match:
                result["availability"] = f"rehearses {match.group(1)} times a week"
                break

        # Musical influences detection
        influence_patterns = [
            r"like\s+([a-zA-Z\s]+?)(?:\s|$|,)",
            r"sounds?\s+like\s+([a-zA-Z\s]+?)(?:\s|$|,)",
            r"similar\s+to\s+([a-zA-Z\s]+?)(?:\s|$|,)"
        ]

        for pattern in influence_patterns:
            matches = re.findall(pattern, query, re.IGNORECASE)
            for match in matches:
                clean_match = match.strip()
                if len(clean_match) > 2:
                    result["musical_influences"].append(clean_match.title())

        # Collaboration intent detection
        if any(word in query.lower() for word in ["band", "group", "bandmate"]):
            result["collaboration_intent"] = "band formation"
        elif any(word in query.lower() for word in ["session", "gig", "recording"]):
            result["collaboration_intent"] = "session work"
        elif any(word in query.lower() for word in ["duo", "pair", "partner"]):
            result["collaboration_intent"] = "duo collaboration"

        # Clean up empty lists
        result["instruments"] = list(set(result["instruments"])) if result["instruments"] else None
        result["musical_influences"] = result["musical_influences"] if result["musical_influences"] else None

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

# Initialize parser
parser = MusicQueryParser()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "services": {
            "openai": parser.openai_client is not None,
            "spacy": parser.nlp is not None
        }
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
                "collaboration_intent": "session work"
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
                "collaboration_intent": "duo collaboration"
            }
        }
    ]

    return jsonify({"examples": examples})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)