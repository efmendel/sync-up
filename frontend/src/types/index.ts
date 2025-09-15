export interface Profile {
  id: string;
  name: string;
  location: string;
  instruments: string[];
  primaryInstrument: string;
  genres: string[];
  experience_level: string;
  collaboration_intent: string;
  bio: string;
  availability: string;
  musical_influences: string[];
  compatibility_score?: number;
  avatar?: string;
  age: number;
  yearsPracticing: number;
  hourlyRate?: number;
  skills: string[];
  equipment: string[];
  socialMedia?: {
    instagram?: string;
    spotify?: string;
    soundcloud?: string;
    youtube?: string;
  };
  achievements: string[];
  preferredGenres: string[];
  rehearsalSpace?: boolean;
  transportationPreference: string;
  isVerified: boolean;
  joinDate: string;
  lastActive: string;
  rating: number;
  reviewCount: number;
}

export interface ParsedQuery {
  instruments?: string[];
  gender?: string;
  location?: string;
  availability?: string;
  musical_influences?: string[];
  collaboration_intent?: string;
  parsed_by?: string;
  confidence?: string;
  timestamp?: string;
  original_query?: string;
}

export interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export interface ResultsSectionProps {
  profiles: Profile[];
  parsedQuery: ParsedQuery | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProfileCardProps {
  profile: Profile;
  parsedQuery: ParsedQuery | null;
}