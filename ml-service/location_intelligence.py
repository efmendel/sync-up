"""
NYC Location Intelligence System for Music Collaboration Matching
Provides neighborhood-based location matching without requiring external APIs
"""

import re
from typing import Dict, List, Tuple, Optional, Any
import json
import logging

logger = logging.getLogger(__name__)

class NYCLocationIntelligence:
    def __init__(self):
        """Initialize NYC location intelligence system"""
        self.neighborhoods = self._build_comprehensive_neighborhoods()
        self.borough_mapping = self._build_borough_mapping()
        self.aliases = self._build_location_aliases()
        self.proximity_matrix = self._build_proximity_matrix()

        logger.info(f"NYC Location Intelligence initialized with {len(self.neighborhoods)} neighborhoods")

    def _build_comprehensive_neighborhoods(self) -> Dict[str, Dict[str, Any]]:
        """Build comprehensive NYC neighborhood database"""
        return {
            # MANHATTAN
            "lower_east_side": {
                "name": "Lower East Side",
                "borough": "Manhattan",
                "zone": "lower_manhattan",
                "aliases": ["les", "lower east side", "loisaida"]
            },
            "east_village": {
                "name": "East Village",
                "borough": "Manhattan",
                "zone": "lower_manhattan",
                "aliases": ["east village", "ev", "alphabet city"]
            },
            "west_village": {
                "name": "West Village",
                "borough": "Manhattan",
                "zone": "lower_manhattan",
                "aliases": ["west village", "greenwich village", "the village"]
            },
            "soho": {
                "name": "SoHo",
                "borough": "Manhattan",
                "zone": "lower_manhattan",
                "aliases": ["soho", "south of houston"]
            },
            "tribeca": {
                "name": "TriBeCa",
                "borough": "Manhattan",
                "zone": "lower_manhattan",
                "aliases": ["tribeca", "triangle below canal"]
            },
            "nolita": {
                "name": "NoLita",
                "borough": "Manhattan",
                "zone": "lower_manhattan",
                "aliases": ["nolita", "north of little italy"]
            },
            "chinatown": {
                "name": "Chinatown",
                "borough": "Manhattan",
                "zone": "lower_manhattan",
                "aliases": ["chinatown"]
            },
            "little_italy": {
                "name": "Little Italy",
                "borough": "Manhattan",
                "zone": "lower_manhattan",
                "aliases": ["little italy"]
            },
            "financial_district": {
                "name": "Financial District",
                "borough": "Manhattan",
                "zone": "lower_manhattan",
                "aliases": ["financial district", "fidi", "wall street"]
            },

            # MIDTOWN MANHATTAN
            "midtown": {
                "name": "Midtown",
                "borough": "Manhattan",
                "zone": "midtown_manhattan",
                "aliases": ["midtown", "midtown manhattan", "times square area"]
            },
            "times_square": {
                "name": "Times Square",
                "borough": "Manhattan",
                "zone": "midtown_manhattan",
                "aliases": ["times square", "theater district", "broadway"]
            },
            "hells_kitchen": {
                "name": "Hell's Kitchen",
                "borough": "Manhattan",
                "zone": "midtown_manhattan",
                "aliases": ["hells kitchen", "hell's kitchen", "clinton"]
            },
            "murray_hill": {
                "name": "Murray Hill",
                "borough": "Manhattan",
                "zone": "midtown_manhattan",
                "aliases": ["murray hill"]
            },
            "gramercy": {
                "name": "Gramercy",
                "borough": "Manhattan",
                "zone": "midtown_manhattan",
                "aliases": ["gramercy", "gramercy park"]
            },
            "flatiron": {
                "name": "Flatiron",
                "borough": "Manhattan",
                "zone": "midtown_manhattan",
                "aliases": ["flatiron", "flatiron district"]
            },

            # UPPER MANHATTAN
            "upper_east_side": {
                "name": "Upper East Side",
                "borough": "Manhattan",
                "zone": "upper_manhattan",
                "aliases": ["upper east side", "ues", "carnegie hill"]
            },
            "upper_west_side": {
                "name": "Upper West Side",
                "borough": "Manhattan",
                "zone": "upper_manhattan",
                "aliases": ["upper west side", "uws", "lincoln square"]
            },
            "harlem": {
                "name": "Harlem",
                "borough": "Manhattan",
                "zone": "upper_manhattan",
                "aliases": ["harlem", "central harlem", "east harlem"]
            },
            "washington_heights": {
                "name": "Washington Heights",
                "borough": "Manhattan",
                "zone": "upper_manhattan",
                "aliases": ["washington heights", "wa heights"]
            },
            "inwood": {
                "name": "Inwood",
                "borough": "Manhattan",
                "zone": "upper_manhattan",
                "aliases": ["inwood"]
            },

            # BROOKLYN NORTH (Close to Manhattan)
            "williamsburg": {
                "name": "Williamsburg",
                "borough": "Brooklyn",
                "zone": "north_brooklyn",
                "aliases": ["williamsburg", "wburg", "billyburg"]
            },
            "greenpoint": {
                "name": "Greenpoint",
                "borough": "Brooklyn",
                "zone": "north_brooklyn",
                "aliases": ["greenpoint", "green point"]
            },
            "dumbo": {
                "name": "DUMBO",
                "borough": "Brooklyn",
                "zone": "north_brooklyn",
                "aliases": ["dumbo", "down under manhattan bridge"]
            },
            "brooklyn_heights": {
                "name": "Brooklyn Heights",
                "borough": "Brooklyn",
                "zone": "north_brooklyn",
                "aliases": ["brooklyn heights", "bk heights"]
            },
            "park_slope": {
                "name": "Park Slope",
                "borough": "Brooklyn",
                "zone": "north_brooklyn",
                "aliases": ["park slope"]
            },
            "fort_greene": {
                "name": "Fort Greene",
                "borough": "Brooklyn",
                "zone": "north_brooklyn",
                "aliases": ["fort greene"]
            },

            # BROOKLYN CENTRAL
            "prospect_heights": {
                "name": "Prospect Heights",
                "borough": "Brooklyn",
                "zone": "central_brooklyn",
                "aliases": ["prospect heights"]
            },
            "crown_heights": {
                "name": "Crown Heights",
                "borough": "Brooklyn",
                "zone": "central_brooklyn",
                "aliases": ["crown heights"]
            },
            "bed_stuy": {
                "name": "Bedford-Stuyvesant",
                "borough": "Brooklyn",
                "zone": "central_brooklyn",
                "aliases": ["bed stuy", "bedstuy", "bedford stuyvesant", "bedford-stuyvesant"]
            },
            "clinton_hill": {
                "name": "Clinton Hill",
                "borough": "Brooklyn",
                "zone": "central_brooklyn",
                "aliases": ["clinton hill"]
            },
            "carroll_gardens": {
                "name": "Carroll Gardens",
                "borough": "Brooklyn",
                "zone": "central_brooklyn",
                "aliases": ["carroll gardens"]
            },

            # BROOKLYN SOUTH
            "red_hook": {
                "name": "Red Hook",
                "borough": "Brooklyn",
                "zone": "south_brooklyn",
                "aliases": ["red hook"]
            },
            "sunset_park": {
                "name": "Sunset Park",
                "borough": "Brooklyn",
                "zone": "south_brooklyn",
                "aliases": ["sunset park"]
            },
            "bay_ridge": {
                "name": "Bay Ridge",
                "borough": "Brooklyn",
                "zone": "south_brooklyn",
                "aliases": ["bay ridge"]
            },
            "bensonhurst": {
                "name": "Bensonhurst",
                "borough": "Brooklyn",
                "zone": "south_brooklyn",
                "aliases": ["bensonhurst"]
            },
            "coney_island": {
                "name": "Coney Island",
                "borough": "Brooklyn",
                "zone": "south_brooklyn",
                "aliases": ["coney island"]
            },

            # QUEENS WEST (Close to Manhattan)
            "astoria": {
                "name": "Astoria",
                "borough": "Queens",
                "zone": "west_queens",
                "aliases": ["astoria"]
            },
            "long_island_city": {
                "name": "Long Island City",
                "borough": "Queens",
                "zone": "west_queens",
                "aliases": ["long island city", "lic", "hunters point"]
            },
            "sunnyside": {
                "name": "Sunnyside",
                "borough": "Queens",
                "zone": "west_queens",
                "aliases": ["sunnyside"]
            },
            "woodside": {
                "name": "Woodside",
                "borough": "Queens",
                "zone": "west_queens",
                "aliases": ["woodside"]
            },

            # QUEENS CENTRAL
            "elmhurst": {
                "name": "Elmhurst",
                "borough": "Queens",
                "zone": "central_queens",
                "aliases": ["elmhurst"]
            },
            "jackson_heights": {
                "name": "Jackson Heights",
                "borough": "Queens",
                "zone": "central_queens",
                "aliases": ["jackson heights"]
            },
            "corona": {
                "name": "Corona",
                "borough": "Queens",
                "zone": "central_queens",
                "aliases": ["corona"]
            },
            "flushing": {
                "name": "Flushing",
                "borough": "Queens",
                "zone": "central_queens",
                "aliases": ["flushing"]
            },

            # QUEENS EAST
            "forest_hills": {
                "name": "Forest Hills",
                "borough": "Queens",
                "zone": "east_queens",
                "aliases": ["forest hills"]
            },
            "kew_gardens": {
                "name": "Kew Gardens",
                "borough": "Queens",
                "zone": "east_queens",
                "aliases": ["kew gardens"]
            },
            "jamaica": {
                "name": "Jamaica",
                "borough": "Queens",
                "zone": "east_queens",
                "aliases": ["jamaica", "jamaica queens"]
            },
            "queens_village": {
                "name": "Queens Village",
                "borough": "Queens",
                "zone": "east_queens",
                "aliases": ["queens village"]
            },

            # BRONX SOUTH
            "mott_haven": {
                "name": "Mott Haven",
                "borough": "Bronx",
                "zone": "south_bronx",
                "aliases": ["mott haven"]
            },
            "melrose": {
                "name": "Melrose",
                "borough": "Bronx",
                "zone": "south_bronx",
                "aliases": ["melrose"]
            },
            "morrisania": {
                "name": "Morrisania",
                "borough": "Bronx",
                "zone": "south_bronx",
                "aliases": ["morrisania"]
            },
            "concourse": {
                "name": "Concourse",
                "borough": "Bronx",
                "zone": "south_bronx",
                "aliases": ["concourse", "grand concourse"]
            },

            # BRONX CENTRAL
            "fordham": {
                "name": "Fordham",
                "borough": "Bronx",
                "zone": "central_bronx",
                "aliases": ["fordham"]
            },
            "tremont": {
                "name": "Tremont",
                "borough": "Bronx",
                "zone": "central_bronx",
                "aliases": ["tremont"]
            },
            "belmont": {
                "name": "Belmont",
                "borough": "Bronx",
                "zone": "central_bronx",
                "aliases": ["belmont", "little italy bronx"]
            },
            "morris_heights": {
                "name": "Morris Heights",
                "borough": "Bronx",
                "zone": "central_bronx",
                "aliases": ["morris heights"]
            },

            # BRONX NORTH
            "riverdale": {
                "name": "Riverdale",
                "borough": "Bronx",
                "zone": "north_bronx",
                "aliases": ["riverdale"]
            },
            "kingsbridge": {
                "name": "Kingsbridge",
                "borough": "Bronx",
                "zone": "north_bronx",
                "aliases": ["kingsbridge"]
            },
            "woodlawn": {
                "name": "Woodlawn",
                "borough": "Bronx",
                "zone": "north_bronx",
                "aliases": ["woodlawn"]
            },
            "wakefield": {
                "name": "Wakefield",
                "borough": "Bronx",
                "zone": "north_bronx",
                "aliases": ["wakefield"]
            },

            # STATEN ISLAND
            "st_george": {
                "name": "St. George",
                "borough": "Staten Island",
                "zone": "staten_island",
                "aliases": ["st george", "saint george"]
            },
            "stapleton": {
                "name": "Stapleton",
                "borough": "Staten Island",
                "zone": "staten_island",
                "aliases": ["stapleton"]
            },
            "new_brighton": {
                "name": "New Brighton",
                "borough": "Staten Island",
                "zone": "staten_island",
                "aliases": ["new brighton"]
            },
            "great_kills": {
                "name": "Great Kills",
                "borough": "Staten Island",
                "zone": "staten_island",
                "aliases": ["great kills"]
            },
            "tottenville": {
                "name": "Tottenville",
                "borough": "Staten Island",
                "zone": "staten_island",
                "aliases": ["tottenville"]
            }
        }

    def _build_borough_mapping(self) -> Dict[str, str]:
        """Build borough to zone mapping"""
        return {
            "manhattan": ["lower_manhattan", "midtown_manhattan", "upper_manhattan"],
            "brooklyn": ["north_brooklyn", "central_brooklyn", "south_brooklyn"],
            "queens": ["west_queens", "central_queens", "east_queens"],
            "bronx": ["south_bronx", "central_bronx", "north_bronx"],
            "staten_island": ["staten_island"]
        }

    def _build_location_aliases(self) -> Dict[str, str]:
        """Build comprehensive location aliases for parsing"""
        aliases = {}

        # Add neighborhood aliases
        for neighborhood_key, data in self.neighborhoods.items():
            for alias in data["aliases"]:
                aliases[alias.lower()] = neighborhood_key

        # Add common borough aliases
        aliases.update({
            "manhattan": "manhattan",
            "nyc": "new_york_city",
            "new york": "new_york_city",
            "new york city": "new_york_city",
            "brooklyn": "brooklyn",
            "queens": "queens",
            "bronx": "bronx",
            "the bronx": "bronx",
            "staten island": "staten_island",
            "si": "staten_island"
        })

        return aliases

    def _build_proximity_matrix(self) -> Dict[str, Dict[str, int]]:
        """Build proximity scoring matrix between zones"""
        return {
            "lower_manhattan": {
                "lower_manhattan": 100,
                "midtown_manhattan": 80,
                "upper_manhattan": 60,
                "north_brooklyn": 85,  # Very close via subway/walking
                "central_brooklyn": 65,
                "south_brooklyn": 45,
                "west_queens": 70,
                "central_queens": 50,
                "east_queens": 35,
                "south_bronx": 55,
                "central_bronx": 40,
                "north_bronx": 25,
                "staten_island": 20
            },
            "midtown_manhattan": {
                "lower_manhattan": 80,
                "midtown_manhattan": 100,
                "upper_manhattan": 80,
                "north_brooklyn": 75,
                "central_brooklyn": 60,
                "south_brooklyn": 40,
                "west_queens": 75,
                "central_queens": 55,
                "east_queens": 40,
                "south_bronx": 65,
                "central_bronx": 50,
                "north_bronx": 35,
                "staten_island": 25
            },
            "upper_manhattan": {
                "lower_manhattan": 60,
                "midtown_manhattan": 80,
                "upper_manhattan": 100,
                "north_brooklyn": 55,
                "central_brooklyn": 45,
                "south_brooklyn": 30,
                "west_queens": 60,
                "central_queens": 45,
                "east_queens": 30,
                "south_bronx": 75,
                "central_bronx": 65,
                "north_bronx": 50,
                "staten_island": 20
            },
            "north_brooklyn": {
                "lower_manhattan": 85,
                "midtown_manhattan": 75,
                "upper_manhattan": 55,
                "north_brooklyn": 100,
                "central_brooklyn": 80,
                "south_brooklyn": 60,
                "west_queens": 70,
                "central_queens": 50,
                "east_queens": 35,
                "south_bronx": 45,
                "central_bronx": 35,
                "north_bronx": 25,
                "staten_island": 25
            },
            "central_brooklyn": {
                "lower_manhattan": 65,
                "midtown_manhattan": 60,
                "upper_manhattan": 45,
                "north_brooklyn": 80,
                "central_brooklyn": 100,
                "south_brooklyn": 75,
                "west_queens": 55,
                "central_queens": 45,
                "east_queens": 35,
                "south_bronx": 35,
                "central_bronx": 30,
                "north_bronx": 20,
                "staten_island": 30
            },
            "south_brooklyn": {
                "lower_manhattan": 45,
                "midtown_manhattan": 40,
                "upper_manhattan": 30,
                "north_brooklyn": 60,
                "central_brooklyn": 75,
                "south_brooklyn": 100,
                "west_queens": 40,
                "central_queens": 35,
                "east_queens": 30,
                "south_bronx": 25,
                "central_bronx": 20,
                "north_bronx": 15,
                "staten_island": 35
            },
            "west_queens": {
                "lower_manhattan": 70,
                "midtown_manhattan": 75,
                "upper_manhattan": 60,
                "north_brooklyn": 70,
                "central_brooklyn": 55,
                "south_brooklyn": 40,
                "west_queens": 100,
                "central_queens": 80,
                "east_queens": 65,
                "south_bronx": 50,
                "central_bronx": 40,
                "north_bronx": 30,
                "staten_island": 20
            },
            "central_queens": {
                "lower_manhattan": 50,
                "midtown_manhattan": 55,
                "upper_manhattan": 45,
                "north_brooklyn": 50,
                "central_brooklyn": 45,
                "south_brooklyn": 35,
                "west_queens": 80,
                "central_queens": 100,
                "east_queens": 80,
                "south_bronx": 40,
                "central_bronx": 35,
                "north_bronx": 25,
                "staten_island": 15
            },
            "east_queens": {
                "lower_manhattan": 35,
                "midtown_manhattan": 40,
                "upper_manhattan": 30,
                "north_brooklyn": 35,
                "central_brooklyn": 35,
                "south_brooklyn": 30,
                "west_queens": 65,
                "central_queens": 80,
                "east_queens": 100,
                "south_bronx": 30,
                "central_bronx": 25,
                "north_bronx": 20,
                "staten_island": 10
            },
            "south_bronx": {
                "lower_manhattan": 55,
                "midtown_manhattan": 65,
                "upper_manhattan": 75,
                "north_brooklyn": 45,
                "central_brooklyn": 35,
                "south_brooklyn": 25,
                "west_queens": 50,
                "central_queens": 40,
                "east_queens": 30,
                "south_bronx": 100,
                "central_bronx": 80,
                "north_bronx": 65,
                "staten_island": 15
            },
            "central_bronx": {
                "lower_manhattan": 40,
                "midtown_manhattan": 50,
                "upper_manhattan": 65,
                "north_brooklyn": 35,
                "central_brooklyn": 30,
                "south_brooklyn": 20,
                "west_queens": 40,
                "central_queens": 35,
                "east_queens": 25,
                "south_bronx": 80,
                "central_bronx": 100,
                "north_bronx": 80,
                "staten_island": 10
            },
            "north_bronx": {
                "lower_manhattan": 25,
                "midtown_manhattan": 35,
                "upper_manhattan": 50,
                "north_brooklyn": 25,
                "central_brooklyn": 20,
                "south_brooklyn": 15,
                "west_queens": 30,
                "central_queens": 25,
                "east_queens": 20,
                "south_bronx": 65,
                "central_bronx": 80,
                "north_bronx": 100,
                "staten_island": 5
            },
            "staten_island": {
                "lower_manhattan": 20,
                "midtown_manhattan": 25,
                "upper_manhattan": 20,
                "north_brooklyn": 25,
                "central_brooklyn": 30,
                "south_brooklyn": 35,
                "west_queens": 20,
                "central_queens": 15,
                "east_queens": 10,
                "south_bronx": 15,
                "central_bronx": 10,
                "north_bronx": 5,
                "staten_island": 100
            }
        }

    def parse_location(self, location_text: str) -> Optional[Dict[str, Any]]:
        """Parse location from natural language text"""
        if not location_text:
            return None

        location_text = location_text.lower().strip()

        # Direct neighborhood match
        if location_text in self.aliases:
            neighborhood_key = self.aliases[location_text]
            if neighborhood_key in self.neighborhoods:
                return {
                    "type": "neighborhood",
                    "key": neighborhood_key,
                    "data": self.neighborhoods[neighborhood_key],
                    "confidence": 100
                }

        # Partial neighborhood match
        for alias, neighborhood_key in self.aliases.items():
            if alias in location_text or location_text in alias:
                if neighborhood_key in self.neighborhoods:
                    return {
                        "type": "neighborhood",
                        "key": neighborhood_key,
                        "data": self.neighborhoods[neighborhood_key],
                        "confidence": 80
                    }

        # Borough-level match
        for borough in ["manhattan", "brooklyn", "queens", "bronx", "staten island"]:
            if borough in location_text:
                return {
                    "type": "borough",
                    "key": borough,
                    "data": {"name": borough.title(), "borough": borough.title()},
                    "confidence": 60
                }

        # Generic NYC match
        nyc_terms = ["new york", "nyc", "ny"]
        if any(term in location_text for term in nyc_terms):
            return {
                "type": "city",
                "key": "new_york_city",
                "data": {"name": "New York City", "borough": "All"},
                "confidence": 40
            }

        return None

    def get_proximity_score(self, location1: str, location2: str) -> int:
        """Get proximity score between two locations (0-100)"""
        parsed1 = self.parse_location(location1)
        parsed2 = self.parse_location(location2)

        if not parsed1 or not parsed2:
            return 0

        # Exact match
        if parsed1["key"] == parsed2["key"]:
            return 100

        # Get zones for comparison
        zone1 = None
        zone2 = None

        if parsed1["type"] == "neighborhood":
            zone1 = parsed1["data"]["zone"]
        elif parsed1["type"] == "borough":
            # Use best zone from borough
            borough_zones = self.borough_mapping.get(parsed1["key"], [])
            zone1 = borough_zones[0] if borough_zones else None

        if parsed2["type"] == "neighborhood":
            zone2 = parsed2["data"]["zone"]
        elif parsed2["type"] == "borough":
            borough_zones = self.borough_mapping.get(parsed2["key"], [])
            zone2 = borough_zones[0] if borough_zones else None

        if zone1 and zone2 and zone1 in self.proximity_matrix:
            return self.proximity_matrix[zone1].get(zone2, 0)

        return 20  # Default low score for unmatched locations

    def get_nearby_neighborhoods(self, location: str, min_score: int = 30) -> List[Dict[str, Any]]:
        """Get nearby neighborhoods with proximity scores"""
        parsed = self.parse_location(location)
        if not parsed:
            return []

        nearby = []

        for neighborhood_key, neighborhood_data in self.neighborhoods.items():
            score = self.get_proximity_score(location, neighborhood_data["name"])

            if score >= min_score:
                nearby.append({
                    "neighborhood": neighborhood_data["name"],
                    "key": neighborhood_key,
                    "borough": neighborhood_data["borough"],
                    "zone": neighborhood_data["zone"],
                    "proximity_score": score,
                    "travel_description": self._get_travel_description(score)
                })

        # Sort by proximity score (highest first)
        nearby.sort(key=lambda x: x["proximity_score"], reverse=True)

        return nearby

    def _get_travel_description(self, score: int) -> str:
        """Get travel description based on proximity score"""
        if score >= 90:
            return "Same area - walking distance"
        elif score >= 80:
            return "Very close - short subway ride"
        elif score >= 70:
            return "Close - same borough or adjacent"
        elif score >= 50:
            return "Moderate - cross-borough commute"
        elif score >= 30:
            return "Distant - longer commute required"
        else:
            return "Very distant - significant travel time"

    def get_location_stats(self) -> Dict[str, Any]:
        """Get statistics about the location system"""
        zone_counts = {}
        borough_counts = {}

        for neighborhood_data in self.neighborhoods.values():
            zone = neighborhood_data["zone"]
            borough = neighborhood_data["borough"]

            zone_counts[zone] = zone_counts.get(zone, 0) + 1
            borough_counts[borough] = borough_counts.get(borough, 0) + 1

        return {
            "total_neighborhoods": len(self.neighborhoods),
            "total_aliases": len(self.aliases),
            "zones": zone_counts,
            "boroughs": borough_counts,
            "coverage_areas": list(self.proximity_matrix.keys())
        }