'use client';

import { Profile, ParsedQuery } from '../data/mockData';

interface EnhancedProfileCardProps {
  profile: Profile;
  parsedQuery?: ParsedQuery | null;
  rank?: number;
}

export default function EnhancedProfileCard({ profile, parsedQuery, rank }: EnhancedProfileCardProps) {
  const getMatchExplanation = () => {
    const matches = [];
    const score = profile.compatibility_score || 0;

    if (parsedQuery?.instruments && profile.instruments) {
      const matchingInstruments = profile.instruments.filter(inst =>
        parsedQuery.instruments!.some(queryInst =>
          inst.toLowerCase().includes(queryInst.toLowerCase())
        )
      );
      if (matchingInstruments.length > 0) {
        matches.push(`🎸 ${matchingInstruments.join(', ')}`);
      }
    }

    if (parsedQuery?.location && profile.location) {
      if (profile.location.toLowerCase().includes(parsedQuery.location.toLowerCase())) {
        matches.push(`📍 ${parsedQuery.location}`);
      }
    }

    if (parsedQuery?.collaboration_intent && profile.collaboration_intent) {
      if (profile.collaboration_intent.toLowerCase().includes(parsedQuery.collaboration_intent.toLowerCase())) {
        matches.push(`🤝 ${parsedQuery.collaboration_intent}`);
      }
    }

    if (parsedQuery?.availability && profile.availability) {
      if (profile.availability.toLowerCase().includes(parsedQuery.availability.toLowerCase())) {
        matches.push(`⏰ ${parsedQuery.availability}`);
      }
    }

    return matches;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 90) return 'text-green-700';
    if (score >= 80) return 'text-blue-700';
    if (score >= 70) return 'text-yellow-700';
    return 'text-gray-700';
  };

  const matchExplanation = getMatchExplanation();
  const score = profile.compatibility_score || 0;

  // Generate a placeholder avatar with initials
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400',
      'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-teal-400'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group">
      {/* Rank badge */}
      {rank && rank <= 3 && (
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
          #{rank}
        </div>
      )}

      {/* Header with avatar and match score */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className={`w-12 h-12 ${getAvatarColor(profile.name)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}>
            {getInitials(profile.name)}
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>📍 {profile.location}</span>
              {profile.age && <span>• {profile.age} years old</span>}
            </div>
          </div>
        </div>

        {/* Match score */}
        <div className="text-right">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-white font-bold text-sm ${getScoreColor(score)}`}>
            {score}% match
          </div>
          <div className="text-xs text-gray-500 mt-1">compatibility</div>
        </div>
      </div>

      {/* Match explanation */}
      {matchExplanation.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-800 mb-1">✨ Perfect Match For:</div>
          <div className="text-sm text-green-700">
            {matchExplanation.join(' • ')}
          </div>
        </div>
      )}

      {/* Instruments */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">🎸 Instruments</div>
        <div className="flex flex-wrap gap-2">
          {profile.instruments.map((instrument, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {instrument}
            </span>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">🎵 Genres</div>
        <div className="flex flex-wrap gap-2">
          {profile.genres.map((genre, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Experience and collaboration */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Experience</div>
          <div className="text-sm text-gray-600 capitalize">{profile.experience_level}</div>
          {profile.yearsPracticing && (
            <div className="text-xs text-gray-500">{profile.yearsPracticing} years</div>
          )}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Looking for</div>
          <div className="text-sm text-gray-600 capitalize">{profile.collaboration_intent}</div>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-1">⏰ Availability</div>
        <div className="text-sm text-gray-600">{profile.availability}</div>
      </div>

      {/* Musical influences */}
      {profile.musical_influences && profile.musical_influences.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">🎤 Musical Influences</div>
          <div className="flex flex-wrap gap-2">
            {profile.musical_influences.map((influence, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium"
              >
                {influence}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">About</div>
        <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
      </div>

      {/* Contact button */}
      <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 group">
        <span className="flex items-center justify-center space-x-2">
          <span>💬</span>
          <span>Connect</span>
          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
        </span>
      </button>
    </div>
  );
}