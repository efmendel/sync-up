import { demoProfiles } from './demoProfiles';

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

export const mockProfiles: Profile[] = demoProfiles;

export const exampleQueries = [
  {
    text: "Female vocalist in Brooklyn",
    query: "find a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse"
  },
  {
    text: "Jazz pianist in Manhattan",
    query: "looking for a jazz pianist in manhattan for duo collaboration"
  },
  {
    text: "Drummer for indie band",
    query: "drummer needed for indie rock band, must be available 3 times a week"
  },
  {
    text: "Bass player for sessions",
    query: "looking for a bass player in williamsburg for session work, preferably someone who sounds like flea"
  },
  {
    text: "Classical violinist",
    query: "seeking a classical violinist for chamber music collaboration in brooklyn"
  }
];

// Mock query parsing function
export const mockParseQuery = (query: string): ParsedQuery => {
  const parsed: ParsedQuery = {
    original_query: query,
    parsed_by: "mock",
    confidence: "high",
    timestamp: new Date().toISOString()
  };

  // Simple parsing logic for demo
  const queryLower = query.toLowerCase();

  // Extract instruments
  const instruments = [];
  if (queryLower.includes('vocalist') || queryLower.includes('singer') || queryLower.includes('vocals')) instruments.push('vocals');
  if (queryLower.includes('guitar') || queryLower.includes('guitarist')) instruments.push('guitar');
  if (queryLower.includes('bass') || queryLower.includes('bassist')) instruments.push('bass');
  if (queryLower.includes('drum') || queryLower.includes('drummer')) instruments.push('drums');
  if (queryLower.includes('piano') || queryLower.includes('pianist')) instruments.push('piano');
  if (queryLower.includes('violin') || queryLower.includes('violinist')) instruments.push('violin');
  if (queryLower.includes('sax') || queryLower.includes('saxophone')) instruments.push('saxophone');

  if (instruments.length > 0) parsed.instruments = instruments;

  // Extract gender
  if (queryLower.includes('female') || queryLower.includes('woman')) parsed.gender = 'female';
  if (queryLower.includes('male') || queryLower.includes('man')) parsed.gender = 'male';

  // Extract location
  if (queryLower.includes('brooklyn')) parsed.location = 'Brooklyn';
  if (queryLower.includes('manhattan')) parsed.location = 'Manhattan';
  if (queryLower.includes('queens')) parsed.location = 'Queens';
  if (queryLower.includes('williamsburg')) parsed.location = 'Williamsburg';
  if (queryLower.includes('astoria')) parsed.location = 'Astoria';

  // Extract collaboration intent
  if (queryLower.includes('band') || queryLower.includes('form')) parsed.collaboration_intent = 'band formation';
  if (queryLower.includes('session') || queryLower.includes('recording')) parsed.collaboration_intent = 'session work';
  if (queryLower.includes('duo')) parsed.collaboration_intent = 'duo collaboration';
  if (queryLower.includes('jam')) parsed.collaboration_intent = 'jamming';

  // Extract availability
  if (queryLower.includes('twice a week')) parsed.availability = 'twice a week';
  if (queryLower.includes('3 times') || queryLower.includes('three times')) parsed.availability = 'three times a week';
  if (queryLower.includes('weekend')) parsed.availability = 'weekends only';
  if (queryLower.includes('evening')) parsed.availability = 'evenings only';

  // Extract musical influences
  const influences = [];
  if (queryLower.includes('amy winehouse')) influences.push('Amy Winehouse');
  if (queryLower.includes('flea')) influences.push('Flea');
  if (queryLower.includes('john mayer')) influences.push('John Mayer');
  if (queryLower.includes('joni mitchell')) influences.push('Joni Mitchell');

  if (influences.length > 0) parsed.musical_influences = influences;

  return parsed;
};