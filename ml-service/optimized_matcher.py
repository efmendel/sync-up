import json
import math
import re
import time
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime
import logging
from functools import lru_cache
import hashlib
from location_intelligence import NYCLocationIntelligence

logger = logging.getLogger(__name__)

class OptimizedProfileMatcher:
    def __init__(self, profiles_file: str = "musician_profiles.json"):
        """Initialize the optimized profile matching system"""
        self.profiles = self._load_profiles(profiles_file)
        self.instrument_groups = self._define_instrument_groups()
        self.genre_similarities = self._define_genre_similarities()
        self.availability_patterns = self._define_availability_patterns()
        self.location_intelligence = NYCLocationIntelligence()

        # Pre-compute profile features for faster matching
        self._precompute_profile_features()

        # Cache for query results
        self._query_cache = {}

        logger.info(f"OptimizedProfileMatcher initialized with {len(self.profiles)} profiles")

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

    def _precompute_profile_features(self):
        """Pre-compute features for all profiles to speed up matching"""
        for profile in self.profiles:
            # Pre-compute instrument groups (use lists instead of sets for JSON serialization)
            profile['_instrument_groups'] = []
            instruments = profile.get('instruments', [])
            for instrument in instruments:
                for group, group_instruments in self.instrument_groups.items():
                    if instrument.lower() in group_instruments and group not in profile['_instrument_groups']:
                        profile['_instrument_groups'].append(group)

            # Pre-compute genre similarity keys (use lists instead of sets)
            profile['_genre_keys'] = [genre.lower() for genre in profile.get('genres', [])]

            # Pre-compute influence keys (use lists instead of sets)
            profile['_influence_keys'] = [inf.lower() for inf in profile.get('musical_influences', [])]

            # Normalize location for faster matching
            location = profile.get('location', '')
            profile['_location_lower'] = location.lower()
            profile['_location_parts'] = location.lower().split(', ') if location else []

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

    @lru_cache(maxsize=100)
    def calculate_geographic_distance(self, coords1_tuple: Tuple[float, float],
                                    coords2_tuple: Tuple[float, float]) -> float:
        """Calculate distance between two coordinates using Haversine formula (cached)"""
        lat1, lng1 = math.radians(coords1_tuple[0]), math.radians(coords1_tuple[1])
        lat2, lng2 = math.radians(coords2_tuple[0]), math.radians(coords2_tuple[1])

        dlat = lat2 - lat1
        dlng = lng2 - lng1

        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))

        # Earth's radius in miles
        r = 3956
        return c * r

    def score_instrument_compatibility(self, query_instruments: List[str], profile: Dict[str, Any]) -> float:
        """Score instrument compatibility (optimized)"""
        if not query_instruments:
            return 0.5

        profile_instruments = profile.get('instruments', [])
        if not profile_instruments:
            return 0.0

        # Exact match bonus
        query_set = {inst.lower() for inst in query_instruments}
        profile_set = {inst.lower() for inst in profile_instruments}
        exact_matches = len(query_set & profile_set)

        if exact_matches > 0:
            return 1.0  # Perfect match for shared instruments

        # Group compatibility using pre-computed groups
        query_groups = set()
        for instrument in query_instruments:
            for group, instruments in self.instrument_groups.items():
                if instrument.lower() in instruments:
                    query_groups.add(group)

        profile_groups = set(profile.get('_instrument_groups', []))

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
                    compatibility_score = max(compatibility_score, 0.7)  # Increased same group score
                elif (q_group, p_group) in complementary_pairs or (p_group, q_group) in complementary_pairs:
                    compatibility_score = max(compatibility_score, 0.8)  # Complementary

        return compatibility_score

    def score_genre_compatibility(self, query_genres: List[str], profile: Dict[str, Any]) -> float:
        """Score musical genre compatibility with semantic similarity (optimized)"""
        if not query_genres:
            return 0.5

        profile_genre_keys = set(profile.get('_genre_keys', []))
        if not profile_genre_keys:
            return 0.3

        max_similarity = 0.0

        for query_genre in query_genres:
            query_lower = query_genre.lower()

            # Exact match
            if query_lower in profile_genre_keys:
                return 1.0

            # Semantic similarity
            if query_lower in self.genre_similarities:
                for profile_genre in profile_genre_keys:
                    similarity = self.genre_similarities[query_lower].get(profile_genre, 0.0)
                    max_similarity = max(max_similarity, similarity)

        return max_similarity

    def score_location_compatibility(self, query_location: str, profile: Dict[str, Any]) -> float:
        """Score location compatibility using NYC Location Intelligence system"""
        if not query_location:
            return 0.5  # Neutral if location not specified

        profile_location = profile.get('location', '')
        if not profile_location:
            return 0.4

        # Use NYC Location Intelligence for sophisticated location matching
        try:
            proximity_score = self.location_intelligence.get_proximity_score(query_location, profile_location)
            # Convert 0-100 scale to 0-1.0 scale
            return proximity_score / 100.0
        except Exception as e:
            logger.warning(f"Location intelligence failed for '{query_location}' vs '{profile_location}': {e}")
            # Fallback to simple string matching
            if query_location.lower() == profile_location.lower():
                return 1.0
            elif query_location.lower() in profile_location.lower() or profile_location.lower() in query_location.lower():
                return 0.7
            return 0.35

    def score_availability_compatibility(self, query_availability: str, profile_availability: str) -> float:
        """Score availability compatibility (optimized with pre-compiled patterns)"""
        if not query_availability or not profile_availability:
            return 0.5

        query_lower = query_availability.lower()
        profile_lower = profile_availability.lower()

        # Exact match
        if query_lower == profile_lower:
            return 1.0

        # Quick pattern matching
        if 'flexible' in query_lower or 'flexible' in profile_lower:
            return 0.75

        if ('evening' in query_lower and 'evening' in profile_lower) or \
           ('weekend' in query_lower and 'weekend' in profile_lower):
            return 0.9

        # Frequency matching
        if ('twice' in query_lower and 'twice' in profile_lower) or \
           ('once' in query_lower and 'once' in profile_lower):
            return 0.9

        return 0.45

    def score_musical_influence_compatibility(self, query_influences: List[str], profile: Dict[str, Any]) -> float:
        """Score musical influence compatibility (optimized)"""
        if not query_influences:
            return 0.5

        profile_influence_keys = set(profile.get('_influence_keys', []))
        if not profile_influence_keys:
            return 0.4

        # Exact artist match using pre-computed sets
        query_set = {inf.lower() for inf in query_influences}
        exact_matches = len(query_set & profile_influence_keys)

        if exact_matches > 0:
            return min(1.0, 0.8 + (exact_matches * 0.1))

        return 0.35

    def calculate_compatibility_score(self, query: Dict[str, Any], profile: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        """Calculate overall compatibility score (optimized)"""
        # Optimized weights for better scoring
        weights = {
            "instruments": 0.30,     # Increased weight for instruments
            "genres": 0.20,
            "location": 0.15,
            "availability": 0.15,
            "influences": 0.15,
            "collaboration_intent": 0.05  # Reduced weight
        }

        scores = {}

        # Instrument compatibility (optimized)
        query_instruments = query.get('instruments', []) or []
        scores['instruments'] = self.score_instrument_compatibility(query_instruments, profile)

        # Genre compatibility (optimized)
        query_genres = query.get('musical_influences', []) or []  # Use influences as genre proxy
        scores['genres'] = self.score_genre_compatibility(query_genres, profile)

        # Location compatibility (optimized)
        query_location = query.get('location')
        scores['location'] = self.score_location_compatibility(query_location, profile)

        # Availability compatibility (optimized)
        query_availability = query.get('availability')
        profile_availability = profile.get('availability')
        scores['availability'] = self.score_availability_compatibility(query_availability, profile_availability)

        # Musical influences compatibility (optimized)
        query_influences = query.get('musical_influences', []) or []
        scores['influences'] = self.score_musical_influence_compatibility(query_influences, profile)

        # Collaboration intent compatibility (simplified)
        query_intent = query.get('collaboration_intent')
        profile_intent = profile.get('collaboration_intent')
        if query_intent and profile_intent:
            if query_intent.lower() == profile_intent.lower():
                scores['collaboration_intent'] = 1.0
            elif 'band' in query_intent.lower() and 'band' in profile_intent.lower():
                scores['collaboration_intent'] = 0.9
            else:
                scores['collaboration_intent'] = 0.6
        else:
            scores['collaboration_intent'] = 0.7  # More neutral

        # Calculate weighted total score
        total_score = sum(scores[factor] * weights[factor] for factor in weights.keys())

        return total_score, scores

    def find_matches(self, query: Dict[str, Any], min_compatibility: float = 0.7,
                    max_results: int = 20) -> Dict[str, Any]:
        """Find matching profiles (optimized for speed)"""
        start_time = time.time()

        # Create cache key for query
        query_str = json.dumps(query, sort_keys=True)
        cache_key = hashlib.md5(query_str.encode()).hexdigest()
        cache_key_full = f"{cache_key}_{min_compatibility}_{max_results}"

        # Check cache
        if cache_key_full in self._query_cache:
            cached_result = self._query_cache[cache_key_full].copy()
            cached_result["from_cache"] = True
            return cached_result

        matches = []

        # Pre-filter profiles for obvious mismatches to speed up processing
        candidate_profiles = self.profiles

        # Quick filter by instrument if specified
        query_instruments = query.get('instruments', [])
        if query_instruments:
            query_inst_set = {inst.lower() for inst in query_instruments}
            candidate_profiles = []

            for profile in self.profiles:
                profile_inst_set = {inst.lower() for inst in profile.get('instruments', [])}
                # Include if shared instruments OR complementary instrument groups
                if query_inst_set & profile_inst_set:  # Shared instruments
                    candidate_profiles.append(profile)
                elif set(profile.get('_instrument_groups', [])) & {
                    group for inst in query_instruments
                    for group, group_insts in self.instrument_groups.items()
                    if inst.lower() in group_insts
                }:  # Complementary groups
                    candidate_profiles.append(profile)

        for profile in candidate_profiles:
            compatibility_score, detailed_scores = self.calculate_compatibility_score(query, profile)

            if compatibility_score >= min_compatibility:
                # Clean up profile by removing internal fields
                clean_profile = {k: v for k, v in profile.items() if not k.startswith('_')}

                match = {
                    "profile": clean_profile,
                    "compatibility_score": round(compatibility_score, 3),
                    "detailed_scores": {k: round(v, 3) for k, v in detailed_scores.items()},
                    "explanation": self._generate_match_explanation(query, profile, detailed_scores)
                }
                matches.append(match)

        # Sort by compatibility score (descending)
        matches.sort(key=lambda x: x['compatibility_score'], reverse=True)

        # Limit results
        matches = matches[:max_results]

        processing_time = (time.time() - start_time) * 1000  # Convert to ms

        result = {
            "matches": matches,
            "total_found": len(matches),
            "processing_time_ms": round(processing_time, 2),
            "query_summary": self._generate_query_summary(query),
            "search_timestamp": datetime.now().isoformat(),
            "from_cache": False
        }

        # Cache the result
        if len(self._query_cache) < 100:  # Limit cache size
            self._query_cache[cache_key_full] = result.copy()

        return result

    def _generate_match_explanation(self, query: Dict[str, Any], profile: Dict[str, Any],
                                   scores: Dict[str, float]) -> str:
        """Generate human-readable explanation for why this profile matches"""
        explanations = []

        # Instrument compatibility
        if scores['instruments'] >= 0.8:
            query_instruments = query.get('instruments', []) or []
            profile_instruments = profile.get('instruments', []) or []
            shared = list({inst.lower() for inst in query_instruments} &
                         {inst.lower() for inst in profile_instruments})
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
            shared_influences = list({inf.lower() for inf in query_influences} &
                                   {inf.lower() for inf in profile_influences})
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
            influences = query['musical_influences'][:3]
            parts.append(f"Influences: {', '.join(influences)}")
        if query.get('collaboration_intent'):
            parts.append(f"Intent: {query['collaboration_intent']}")

        return " | ".join(parts) if parts else "General search"