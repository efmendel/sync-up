'use client';

import Link from 'next/link';
import { ProfileCardProps } from '../types';

export default function ProfileCard({ profile, parsedQuery }: ProfileCardProps) {
  const compatibilityScore = profile.compatibility_score;

  // Highlight matching criteria from parsed query
  const matchHighlights: string[] = [];

  if (parsedQuery?.instruments) {
    const matchingInstruments = profile.instruments?.filter(inst =>
      parsedQuery.instruments!.some(queryInst =>
        inst.toLowerCase().includes(queryInst.toLowerCase())
      )
    ) || [];
    if (matchingInstruments.length > 0) {
      matchHighlights.push(`🎸 ${matchingInstruments.join(', ')}`);
    }
  }

  if (parsedQuery?.genres) {
    const matchingGenres = profile.genres?.filter(genre =>
      parsedQuery.genres!.some(queryGenre =>
        genre.toLowerCase().includes(queryGenre.toLowerCase())
      )
    ) || [];
    if (matchingGenres.length > 0) {
      matchHighlights.push(`🎵 ${matchingGenres.join(', ')}`);
    }
  }

  return (
    <Link href={`/profile/${profile.id}`} className="block">
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg hover:border-blue-500 cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xl font-bold text-gray-800 mb-1">
            {profile.name}
          </div>
          <div className="text-blue-600 font-semibold text-sm">
            📍 {profile.location || 'Location not specified'}
          </div>
        </div>
        {compatibilityScore !== null && compatibilityScore !== undefined && (
          <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {Math.round(compatibilityScore * 100)}% match
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {profile.instruments && profile.instruments.length > 0 ?
            profile.instruments.map((inst, index) => (
              <span key={index} className="bg-blue-200 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                {inst}
              </span>
            )) :
            <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
              No instruments listed
            </span>
          }
        </div>
      </div>

      {matchHighlights.length > 0 && (
        <div className="bg-green-100 p-2 rounded-lg mb-3 text-xs text-green-800">
          <strong>✨ Query Match:</strong> {matchHighlights.join(' • ')}
        </div>
      )}

      <div className="text-sm text-gray-600 space-y-2">
        <div>
          <span className="font-semibold text-gray-700">Genres:</span>{' '}
          {profile.genres && profile.genres.length > 0 ? profile.genres.join(', ') : 'Not specified'}
        </div>
        <div>
          <span className="font-semibold text-gray-700">Experience:</span>{' '}
          {profile.experience_level || profile.experienceLevel || 'Not specified'}
        </div>
        <div>
          <span className="font-semibold text-gray-700">Collaboration:</span>{' '}
          <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {profile.collaboration_intent || profile.collaborationType || 'Not specified'}
          </span>
        </div>
        {profile.bio && (
          <div className="mt-3 italic text-gray-600">
            &quot;{profile.bio}&quot;
          </div>
        )}
      </div>
      </div>
    </Link>
  );
}