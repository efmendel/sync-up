'use client';

import { useState, useEffect, useRef } from 'react';
import { ParsedQuery } from '../data/mockData';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onQueryParse?: (parsed: ParsedQuery) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function SearchBar({ onSearch, onQueryParse, isLoading, placeholder }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock parsing function for real-time preview
  const parseQuery = (text: string): ParsedQuery | null => {
    if (!text.trim()) return null;

    const parsed: ParsedQuery = {
      original_query: text,
      parsed_by: "real-time",
      confidence: "high",
      timestamp: new Date().toISOString()
    };

    const queryLower = text.toLowerCase();

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
    if (queryLower.includes('lower east side') || queryLower.includes('les')) parsed.location = 'Lower East Side';

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
    if (queryLower.includes('patti smith')) influences.push('Patti Smith');

    if (influences.length > 0) parsed.musical_influences = influences;

    return parsed;
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const parsed = parseQuery(query);
      setParsedQuery(parsed);
      if (parsed && onQueryParse) {
        onQueryParse(parsed);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onQueryParse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowPreview(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowPreview(e.target.value.trim().length > 0);
  };

  const handleFocus = () => {
    if (query.trim()) {
      setShowPreview(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding to allow clicking on preview
    setTimeout(() => setShowPreview(false), 200);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder || "e.g. 'find a female vocalist in brooklyn who rehearses twice a week'"}
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl bg-white shadow-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 pr-16"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🔍</span>
                <span>Search</span>
              </div>
            )}
          </button>
        </div>

        {/* Real-time parsing preview */}
        {showPreview && parsedQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="text-sm text-gray-600 mb-2 font-medium">AI Query Understanding:</div>
            <div className="space-y-2">
              {parsedQuery.instruments && (
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 font-medium">🎸 Instruments:</span>
                  <div className="flex flex-wrap gap-1">
                    {parsedQuery.instruments.map((instrument, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        {instrument}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {parsedQuery.location && (
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-medium">📍 Location:</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    {parsedQuery.location}
                  </span>
                </div>
              )}

              {parsedQuery.collaboration_intent && (
                <div className="flex items-center space-x-2">
                  <span className="text-purple-600 font-medium">🤝 Goal:</span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    {parsedQuery.collaboration_intent}
                  </span>
                </div>
              )}

              {parsedQuery.availability && (
                <div className="flex items-center space-x-2">
                  <span className="text-orange-600 font-medium">⏰ Availability:</span>
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                    {parsedQuery.availability}
                  </span>
                </div>
              )}

              {parsedQuery.musical_influences && (
                <div className="flex items-center space-x-2">
                  <span className="text-pink-600 font-medium">🎵 Influences:</span>
                  <div className="flex flex-wrap gap-1">
                    {parsedQuery.musical_influences.map((influence, index) => (
                      <span key={index} className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-medium">
                        {influence}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {parsedQuery.gender && (
                <div className="flex items-center space-x-2">
                  <span className="text-indigo-600 font-medium">👤 Gender:</span>
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
                    {parsedQuery.gender}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}