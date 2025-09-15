'use client';

import { ResultsSectionProps } from '../types';
import ProfileCard from './ProfileCard';
import LoadingSpinner from './LoadingSpinner';

export default function ResultsSection({ profiles, parsedQuery, isLoading, error }: ResultsSectionProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-2xl">
        <div className="text-center py-10 text-red-500 text-lg">
          ❌ {error}
        </div>
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-2xl">
        <div className="text-center py-10 text-gray-500 text-lg">
          😔 No musicians found matching your query. Try a different search.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-5 pb-3 border-b-2 border-gray-100">
        <div className="text-blue-600 font-semibold">
          Found {profiles.length} musician{profiles.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            parsedQuery={parsedQuery}
          />
        ))}
      </div>
    </div>
  );
}