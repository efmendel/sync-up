import json
import math
import re
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ProfileMatcher:
    def __init__(self, profiles_file: str = "musician_profiles.json"):
        """Initialize the profile matching system"""
        self.profiles = self._load_profiles(profiles_file)
        self.instrument_groups = self._define_instrument_groups()
        self.genre_similarities = self._define_genre_similarities()
        self.availability_patterns = self._define_availability_patterns()

    def _load_profiles(self, filename: str) -> List[Dict[str, Any]]:
        """Load musician profiles from JSON file"""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
                return data.get('profiles', [])
        except FileNotFoundError:
            logger.error(f"Profiles file {filename} not found")
            return []
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON in {filename}")
            return []

    def _define_instrument_groups(self) -> Dict[str, List[str]]:
        """Define instrument groups for compatibility scoring"""
        return {
            "rhythm_section": ["bass", "drums"],
            "harmony": ["piano", "guitar", "organ", "synthesizer", "accordion"],
            "melody": ["vocals", "violin", "saxophone", "trumpet", "flute", "cello"],
            "world": ["oud", "sitar", "kora", "erhu", "shamisen", "tabla", "djembe"],
            "folk": ["fiddle", "mandolin", "banjo", "ukulele", "harmonica"],
            "percussion": ["drums", "percussion", "djembe", "tabla", "talking drum"],
            "strings": ["guitar", "bass", "violin", "cello", "mandolin", "sitar", "kora"],
            "winds": ["saxophone", "trumpet", "flute", "clarinet", "oboe"],
            "keyboards": ["piano", "organ", "synthesizer", "accordion"]
        }

    def _define_genre_similarities(self) -> Dict[str, Dict[str, float]]:
        """Define genre similarity scores for semantic matching"""
        return {
            "jazz": {
                "jazz": 1.0, "blues": 0.8, "soul": 0.7, "fusion": 0.9, "bebop": 0.9,
                "hard bop": 0.9, "contemporary jazz": 0.8, "latin jazz": 0.7, "neo-soul": 0.6
            },
            "rock": {
                "rock": 1.0, "indie rock": 0.9, "alternative": 0.8, "blues": 0.7,
                "funk": 0.6, "pop": 0.5, "indie": 0.8, "post-rock": 0.7
            },
            "blues": {
                "blues": 1.0, "jazz": 0.8, "rock": 0.7, "soul": 0.8, "r&b": 0.7,
                "gospel": 0.6, "country": 0.5, "americana": 0.6
            },
            "soul": {
                "soul": 1.0, "r&b": 0.9, "neo-soul": 0.9, "gospel": 0.8, "jazz": 0.7,
                "blues": 0.8, "funk": 0.7
            },
            "folk": {
                "folk": 1.0, "indie folk": 0.9, "americana": 0.8, "country": 0.7,
                "singer-songwriter": 0.8, "bluegrass": 0.6, "celtic": 0.5
            },
            "classical": {
                "classical": 1.0, "chamber": 0.9, "contemporary classical": 0.8,
                "opera": 0.7, "baroque": 0.8, "romantic": 0.8
            },
            "world music": {
                "world music": 1.0, "world fusion": 0.8, "traditional": 0.7,
                "ethnic": 0.8, "cultural": 0.7
            },
            "electronic": {
                "electronic": 1.0, "ambient": 0.7, "experimental": 0.6, "fusion": 0.5,
                "contemporary": 0.6
            },
            "latin": {
                "latin": 1.0, "salsa": 0.9, "bossa nova": 0.8, "tango": 0.7,
                "latin jazz": 0.8, "brazilian": 0.8, "flamenco": 0.6
            },
            "indie": {
                "indie": 1.0, "indie rock": 0.9, "indie folk": 0.8, "alternative": 0.8,
                "experimental": 0.6, "post-rock": 0.7
            }
        }

    def _define_availability_patterns(self) -> Dict[str, Dict[str, float]]:
        """Define availability compatibility patterns"""
        return {
            "frequency": {
                ("once a week", "once a week"): 1.0,
                ("twice a week", "twice a week"): 1.0,
                ("3 times a week", "3 times a week"): 1.0,
                ("twice a week", "once a week"): 0.8,
                ("3 times a week", "twice a week"): 0.9,
                ("flexible schedule", "flexible schedule"): 1.0,
                ("full-time", "full-time"): 1.0,
                ("part-time", "part-time"): 0.9,
                ("weekends only", "weekends only"): 1.0,
                ("evenings only", "evenings only"): 1.0,
                ("weekends only", "flexible schedule"): 0.7,
                ("evenings only", "flexible schedule"): 0.7,
                ("flexible schedule", "twice a week"): 0.8
            }
        }

    def calculate_geographic_distance(self, coords1: Dict[str, float], coords2: Dict[str, float]) -> float:
        """Calculate distance between two coordinates using Haversine formula"""
        if not coords1 or not coords2:
            return float('inf')

        lat1, lng1 = math.radians(coords1['lat']), math.radians(coords1['lng'])
        lat2, lng2 = math.radians(coords2['lat']), math.radians(coords2['lng'])

        dlat = lat2 - lat1
        dlng = lng2 - lng1

        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))

        # Earth's radius in miles
        r = 3956
        return c * r

    def score_instrument_compatibility(self, query_instruments: List[str], profile_instruments: List[str]) -> float:
        """Score instrument compatibility"""
        if not query_instruments or not profile_instruments:
            return 0.0

        # Exact match bonus
        exact_matches = len(set(query_instruments) & set(profile_instruments))
        if exact_matches > 0:
            return 1.0  # Perfect match for shared instruments

        # Group compatibility
        query_groups = set()
        profile_groups = set()

        for instrument in query_instruments:
            for group, instruments in self.instrument_groups.items():
                if instrument.lower() in instruments:
                    query_groups.add(group)

        for instrument in profile_instruments:
            for group, instruments in self.instrument_groups.items():
                if instrument.lower() in instruments:
                    profile_groups.add(group)

        # Complementary instruments score higher
        complementary_pairs = [
            ("rhythm_section", "harmony"),
            ("rhythm_section", "melody"),
            ("harmony", "melody"),
            ("strings", "percussion"),
            ("winds", "rhythm_section")
        ]

        compatibility_score = 0.0
        for q_group in query_groups:
            for p_group in profile_groups:
                if q_group == p_group:
                    compatibility_score = max(compatibility_score, 0.6)  # Same group
                elif (q_group, p_group) in complementary_pairs or (p_group, q_group) in complementary_pairs:
                    compatibility_score = max(compatibility_score, 0.8)  # Complementary

        return compatibility_score

    def score_genre_compatibility(self, query_genres: List[str], profile_genres: List[str]) -> float:
        """Score musical genre compatibility with semantic similarity"""
        if not query_genres or not profile_genres:
            return 0.0

        max_similarity = 0.0

        for query_genre in query_genres:
            for profile_genre in profile_genres:
                # Exact match
                if query_genre.lower() == profile_genre.lower():
                    return 1.0

                # Semantic similarity
                query_lower = query_genre.lower()
                profile_lower = profile_genre.lower()

                if query_lower in self.genre_similarities:
                    similarity = self.genre_similarities[query_lower].get(profile_lower, 0.0)
                    max_similarity = max(max_similarity, similarity)

                if profile_lower in self.genre_similarities:
                    similarity = self.genre_similarities[profile_lower].get(query_lower, 0.0)
                    max_similarity = max(max_similarity, similarity)

        return max_similarity

    def score_location_compatibility(self, query_location: str, query_coords: Dict[str, float],
                                   profile_location: str, profile_coords: Dict[str, float]) -> float:
        """Score location compatibility based on distance"""
        if not query_location or not profile_location:
            return 0.5  # Neutral if location not specified

        # Exact location match
        if query_location.lower() == profile_location.lower():
            return 1.0

        # Same city/state partial match
        query_parts = query_location.lower().split(', ')
        profile_parts = profile_location.lower().split(', ')

        if len(query_parts) >= 2 and len(profile_parts) >= 2:
            # Same state
            if query_parts[-1] == profile_parts[-1]:
                # Same city and state
                if query_parts[-2] == profile_parts[-2]:
                    return 0.9
                # Same state, different city
                return 0.6

        # Distance-based scoring
        if query_coords and profile_coords:
            distance = self.calculate_geographic_distance(query_coords, profile_coords)

            if distance <= 10:      # Within 10 miles
                return 0.9
            elif distance <= 25:    # Within 25 miles
                return 0.8
            elif distance <= 50:    # Within 50 miles
                return 0.7
            elif distance <= 100:   # Within 100 miles
                return 0.6
            elif distance <= 250:   # Within 250 miles
                return 0.4
            else:                   # Over 250 miles
                return 0.2

        return 0.3  # Default for no distance info

    def score_availability_compatibility(self, query_availability: str, profile_availability: str) -> float:
        """Score availability compatibility"""
        if not query_availability or not profile_availability:
            return 0.5  # Neutral if not specified

        query_lower = query_availability.lower()
        profile_lower = profile_availability.lower()

        # Exact match
        if query_lower == profile_lower:
            return 1.0

        # Pattern matching for frequency
        frequency_patterns = {
            r'once.*week': 'once a week',
            r'twice.*week': 'twice a week',
            r'2.*times.*week': 'twice a week',
            r'3.*times.*week': '3 times a week',
            r'thrice.*week': '3 times a week',
            r'weekend.*only': 'weekends only',
            r'evening.*only': 'evenings only',
            r'flexible': 'flexible schedule',
            r'full.?time': 'full-time',
            r'part.?time': 'part-time'
        }

        def normalize_availability(text):
            text_lower = text.lower()
            for pattern, normalized in frequency_patterns.items():
                if re.search(pattern, text_lower):
                    return normalized
            return text_lower

        query_normalized = normalize_availability(query_availability)
        profile_normalized = normalize_availability(profile_availability)

        # Check predefined compatibility
        availability_key = (query_normalized, profile_normalized)
        reverse_key = (profile_normalized, query_normalized)

        frequency_compat = self.availability_patterns['frequency']

        if availability_key in frequency_compat:
            return frequency_compat[availability_key]
        elif reverse_key in frequency_compat:
            return frequency_compat[reverse_key]

        # Flexible schedule matches well with most things
        if 'flexible' in query_normalized or 'flexible' in profile_normalized:
            return 0.7

        # Time-based compatibility
        if ('evening' in query_normalized and 'evening' in profile_normalized) or \
           ('weekend' in query_normalized and 'weekend' in profile_normalized):
            return 0.9

        return 0.4  # Default moderate compatibility

    def score_musical_influence_compatibility(self, query_influences: List[str],
                                            profile_influences: List[str]) -> float:
        """Score musical influence compatibility"""
        if not query_influences or not profile_influences:
            return 0.5  # Neutral if not specified

        # Exact artist match
        query_set = {inf.lower() for inf in query_influences}
        profile_set = {inf.lower() for inf in profile_influences}

        exact_matches = len(query_set & profile_set)
        if exact_matches > 0:
            return min(1.0, 0.8 + (exact_matches * 0.1))  # Scale with number of matches

        # Genre-based influence matching
        # Extract genres from influences and compare
        influence_genres = self._extract_genres_from_influences(query_influences + profile_influences)
        query_inferred_genres = self._infer_genres_from_influences(query_influences, influence_genres)
        profile_inferred_genres = self._infer_genres_from_influences(profile_influences, influence_genres)

        if query_inferred_genres and profile_inferred_genres:
            genre_score = self.score_genre_compatibility(query_inferred_genres, profile_inferred_genres)
            return genre_score * 0.6  # Reduce weight since it's inferred

        return 0.3  # Low but not zero compatibility

    def _extract_genres_from_influences(self, influences: List[str]) -> Dict[str, List[str]]:
        """Extract likely genres based on well-known artist influences"""
        artist_genres = {
            # Jazz
            "john coltrane": ["jazz", "bebop"], "miles davis": ["jazz", "fusion"],
            "herbie hancock": ["jazz", "fusion"], "chick corea": ["jazz", "fusion"],
            "bill evans": ["jazz"], "charlie parker": ["bebop", "jazz"],

            # Rock/Blues
            "jimi hendrix": ["rock", "blues"], "led zeppelin": ["rock", "blues"],
            "john bonham": ["rock"], "eric clapton": ["blues", "rock"],
            "b.b. king": ["blues"], "muddy waters": ["blues"],

            # Soul/R&B
            "aretha franklin": ["soul", "gospel"], "stevie wonder": ["soul", "r&b"],
            "amy winehouse": ["soul", "jazz"], "adele": ["soul", "pop"],
            "d'angelo": ["neo-soul", "r&b"], "erykah badu": ["neo-soul"],

            # Folk/Country
            "joni mitchell": ["folk", "singer-songwriter"], "bob dylan": ["folk", "rock"],
            "johnny cash": ["country", "folk"], "patsy cline": ["country"],

            # Latin
            "tito puente": ["latin", "salsa"], "astor piazzolla": ["tango", "classical"],

            # Classical
            "yo-yo ma": ["classical", "chamber"], "itzhak perlman": ["classical"],

            # World
            "ravi shankar": ["indian classical", "world music"],
            "toumani diabaté": ["west african", "world music"]
        }

        result = {}
        for influence in influences:
            influence_lower = influence.lower()
            if influence_lower in artist_genres:
                result[influence_lower] = artist_genres[influence_lower]

        return result

    def _infer_genres_from_influences(self, influences: List[str],
                                    artist_genres: Dict[str, List[str]]) -> List[str]:
        """Infer genres from musical influences"""
        inferred_genres = []
        for influence in influences:
            influence_lower = influence.lower()
            if influence_lower in artist_genres:
                inferred_genres.extend(artist_genres[influence_lower])

        return list(set(inferred_genres))  # Remove duplicates

    def calculate_compatibility_score(self, query: Dict[str, Any], profile: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        """Calculate overall compatibility score between query and profile"""

        # Define weights for different factors
        weights = {
            "instruments": 0.25,
            "genres": 0.20,
            "location": 0.15,
            "availability": 0.15,
            "influences": 0.15,
            "collaboration_intent": 0.10
        }

        scores = {}

        # Instrument compatibility
        query_instruments = query.get('instruments', []) or []
        profile_instruments = profile.get('instruments', []) or []
        scores['instruments'] = self.score_instrument_compatibility(query_instruments, profile_instruments)

        # Genre compatibility
        query_genres = query.get('musical_influences', []) or []  # Use influences as genres proxy
        profile_genres = profile.get('genres', []) or []
        scores['genres'] = self.score_genre_compatibility(query_genres, profile_genres)

        # Location compatibility
        query_location = query.get('location')
        profile_location = profile.get('location')
        query_coords = None  # Would need to geocode in real implementation
        profile_coords = profile.get('coordinates', {})
        scores['location'] = self.score_location_compatibility(
            query_location, query_coords, profile_location, profile_coords
        )

        # Availability compatibility
        query_availability = query.get('availability')
        profile_availability = profile.get('availability')
        scores['availability'] = self.score_availability_compatibility(query_availability, profile_availability)

        # Musical influences compatibility
        query_influences = query.get('musical_influences', []) or []
        profile_influences = profile.get('musical_influences', []) or []
        scores['influences'] = self.score_musical_influence_compatibility(query_influences, profile_influences)

        # Collaboration intent compatibility
        query_intent = query.get('collaboration_intent')
        profile_intent = profile.get('collaboration_intent')
        if query_intent and profile_intent:
            if query_intent.lower() == profile_intent.lower():
                scores['collaboration_intent'] = 1.0
            elif any(word in query_intent.lower() for word in ['band', 'group']) and \
                 any(word in profile_intent.lower() for word in ['band', 'group']):
                scores['collaboration_intent'] = 0.9
            else:
                scores['collaboration_intent'] = 0.4
        else:
            scores['collaboration_intent'] = 0.5

        # Calculate weighted total score
        total_score = sum(scores[factor] * weights[factor] for factor in weights.keys())

        return total_score, scores

    def find_matches(self, query: Dict[str, Any], min_compatibility: float = 0.7,
                    max_results: int = 20) -> List[Dict[str, Any]]:
        """Find matching profiles based on query with explanations"""

        start_time = datetime.now()
        matches = []

        for profile in self.profiles:
            compatibility_score, detailed_scores = self.calculate_compatibility_score(query, profile)

            if compatibility_score >= min_compatibility:
                match = {
                    "profile": profile,
                    "compatibility_score": round(compatibility_score, 3),
                    "detailed_scores": {k: round(v, 3) for k, v in detailed_scores.items()},
                    "explanation": self._generate_match_explanation(query, profile, detailed_scores)
                }
                matches.append(match)

        # Sort by compatibility score (descending)
        matches.sort(key=lambda x: x['compatibility_score'], reverse=True)

        # Limit results
        matches = matches[:max_results]

        processing_time = (datetime.now() - start_time).total_seconds() * 1000  # Convert to ms

        return {
            "matches": matches,
            "total_found": len(matches),
            "processing_time_ms": round(processing_time, 2),
            "query_summary": self._generate_query_summary(query),
            "search_timestamp": datetime.now().isoformat()
        }

    def _generate_match_explanation(self, query: Dict[str, Any], profile: Dict[str, Any],
                                   scores: Dict[str, float]) -> str:
        """Generate human-readable explanation for why this profile matches"""

        explanations = []

        # Instrument compatibility
        if scores['instruments'] >= 0.8:
            query_instruments = query.get('instruments', []) or []
            profile_instruments = profile.get('instruments', []) or []
            shared = list(set(query_instruments) & set(profile_instruments))
            if shared:
                explanations.append(f"Plays same instruments: {', '.join(shared)}")
            else:
                explanations.append("Instruments complement each other well")

        # Genre compatibility
        if scores['genres'] >= 0.7:
            explanations.append("Strong musical genre compatibility")

        # Location compatibility
        if scores['location'] >= 0.8:
            query_location = query.get('location', '')
            profile_location = profile.get('location', '')
            if query_location.lower() == profile_location.lower():
                explanations.append(f"Same location: {profile_location}")
            else:
                explanations.append("Close geographic proximity")

        # Availability compatibility
        if scores['availability'] >= 0.8:
            explanations.append("Compatible schedules and availability")

        # Influence compatibility
        if scores['influences'] >= 0.7:
            query_influences = query.get('musical_influences', []) or []
            profile_influences = profile.get('musical_influences', []) or []
            shared_influences = list(set([inf.lower() for inf in query_influences]) &
                                   set([inf.lower() for inf in profile_influences]))
            if shared_influences:
                explanations.append(f"Shared influences: {', '.join(shared_influences)}")
            else:
                explanations.append("Similar musical taste and influences")

        # Collaboration intent
        if scores['collaboration_intent'] >= 0.8:
            explanations.append("Aligned collaboration goals")

        if not explanations:
            explanations.append("Good overall compatibility across multiple factors")

        return "; ".join(explanations[:3])  # Limit to top 3 reasons

    def _generate_query_summary(self, query: Dict[str, Any]) -> str:
        """Generate summary of the search query"""
        parts = []

        if query.get('instruments'):
            parts.append(f"Instruments: {', '.join(query['instruments'])}")

        if query.get('location'):
            parts.append(f"Location: {query['location']}")

        if query.get('availability'):
            parts.append(f"Availability: {query['availability']}")

        if query.get('musical_influences'):
            influences = query['musical_influences'][:3]  # Show first 3
            parts.append(f"Influences: {', '.join(influences)}")

        if query.get('collaboration_intent'):
            parts.append(f"Intent: {query['collaboration_intent']}")

        return " | ".join(parts) if parts else "General search"