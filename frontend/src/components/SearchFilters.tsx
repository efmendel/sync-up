'use client';

import { useState } from 'react';

export interface FilterOptions {
  instruments: string[];
  locations: string[];
  experienceLevel: string[];
  collaborationType: string[];
  sortBy: 'compatibility' | 'location' | 'experience' | 'name';
  sortOrder: 'asc' | 'desc';
}

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  resultCount?: number;
}

export default function SearchFilters({ onFiltersChange, resultCount }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    instruments: [],
    locations: [],
    experienceLevel: [],
    collaborationType: [],
    sortBy: 'compatibility',
    sortOrder: 'desc'
  });

  const instrumentOptions = [
    'vocals', 'guitar', 'bass', 'drums', 'piano', 'violin', 'saxophone', 'trumpet', 'cello', 'ukulele'
  ];

  const locationOptions = [
    'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island',
    'Williamsburg', 'Lower East Side', 'East Village', 'Park Slope', 'Astoria'
  ];

  const experienceOptions = ['beginner', 'intermediate', 'advanced', 'professional'];

  const collaborationOptions = [
    'band formation', 'session work', 'duo collaboration', 'jamming', 'teaching', 'recording projects'
  ];

  const handleFilterChange = (category: keyof FilterOptions, value: string | string[]) => {
    const newFilters = { ...filters };

    if (Array.isArray(value)) {
      (newFilters[category] as string[]) = value;
    } else {
      (newFilters[category] as string) = value;
    }

    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (category: 'instruments' | 'locations' | 'experienceLevel' | 'collaborationType', value: string) => {
    const currentValues = filters[category];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    handleFilterChange(category, newValues);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterOptions = {
      instruments: [],
      locations: [],
      experienceLevel: [],
      collaborationType: [],
      sortBy: 'compatibility',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return filters.instruments.length +
           filters.locations.length +
           filters.experienceLevel.length +
           filters.collaborationType.length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-gray-900">Filters & Sort</h3>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
            {resultCount !== undefined && (
              <span className="text-sm text-gray-500">
                ({resultCount} results)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                ⌄
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Sort controls - always visible */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="compatibility">Best Match</option>
            <option value="location">Location</option>
            <option value="experience">Experience</option>
            <option value="name">Name</option>
          </select>
          <button
            onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Instruments */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">🎸 Instruments</h4>
            <div className="flex flex-wrap gap-2">
              {instrumentOptions.map((instrument) => (
                <button
                  key={instrument}
                  onClick={() => toggleArrayFilter('instruments', instrument)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.instruments.includes(instrument)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {instrument}
                </button>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">📍 Location</h4>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map((location) => (
                <button
                  key={location}
                  onClick={() => toggleArrayFilter('locations', location)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.locations.includes(location)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">⭐ Experience Level</h4>
            <div className="flex flex-wrap gap-2">
              {experienceOptions.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleArrayFilter('experienceLevel', level)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
                    filters.experienceLevel.includes(level)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Collaboration Type */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">🤝 Collaboration Type</h4>
            <div className="flex flex-wrap gap-2">
              {collaborationOptions.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleArrayFilter('collaborationType', type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.collaborationType.includes(type)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}