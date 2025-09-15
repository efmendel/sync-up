'use client';

import { useSearch } from '../hooks/useSearch';
import Link from 'next/link';

export default function Home() {
  const {
    query,
    setQuery,
    isLoading,
    error,
    hasSearched,
    search,
    clearSearch,
    profiles,
    aiParsing,
    hasResults,
    hasError,
    isEmpty
  } = useSearch({ enableDebounce: false, useAI: true });

  const searchProfiles = async (query: string) => {
    await search(query);
  };

  const exampleQueries = [
    {
      icon: "🎤",
      title: "Vocalist",
      subtitle: "Brooklyn • Soul",
      query: "find a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse"
    },
    {
      icon: "🎸",
      title: "Bassist",
      subtitle: "Williamsburg • Funk",
      query: "looking for a bass player in williamsburg for session work, preferably someone who sounds like flea"
    },
    {
      icon: "🥁",
      title: "Drummer",
      subtitle: "LES • Indie Rock",
      query: "drummer needed for indie rock band in lower east side, must be available 3 times a week"
    },
    {
      icon: "🎹",
      title: "Pianist",
      subtitle: "Manhattan • Jazz",
      query: "seeking a jazz pianist in manhattan for duo collaboration with evening rehearsals"
    },
    {
      icon: "🎻",
      title: "Violinist",
      subtitle: "Brooklyn • Classical",
      query: "looking for a classical violinist for chamber music collaboration in brooklyn"
    },
    {
      icon: "🎷",
      title: "Saxophonist",
      subtitle: "Queens • Latin Jazz",
      query: "need a saxophonist for latin jazz project in queens, professional level preferred"
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-teal-500';
    if (score >= 80) return 'from-blue-500 to-indigo-500';
    if (score >= 70) return 'from-amber-500 to-orange-500';
    return 'from-slate-500 to-gray-500';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-400',
      'from-yellow-400 to-orange-400',
      'from-red-400 to-pink-400',
      'from-indigo-400 to-purple-400',
      'from-teal-400 to-blue-400',
      'from-orange-400 to-red-400'
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-2xl font-bold text-slate-800 hover:text-blue-600 transition-colors"
            >
              🎵 Sync Up
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl rounded-full border border-white/40 hover:bg-white/80 transition-all duration-200 text-slate-700 hover:text-blue-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Edit Profile</span>
            </Link>
            <Link
              href="/profile/1"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200"
            >
              <span>View Demo Profile</span>
            </Link>
          </div>
        </div>

        {/* Modern Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-xl rounded-full px-6 py-3 mb-8 border border-white/40 shadow-lg shadow-black/5">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">AI-Powered Music Collaboration</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-6 tracking-tight">
            Sync Up
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-4 font-light">
            Solo to symphony
          </p>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Connect with talented musicians through intelligent matching.
            Our AI understands your musical needs and finds perfect collaborators.
          </p>
        </div>

        {/* Modern Search Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="card-modern p-8 animate-scale-in">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) {
                searchProfiles(query.trim());
              }
            }}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe what you're looking for... e.g., 'jazz pianist in brooklyn for weekly sessions'"
                  className="w-full pl-14 pr-32 py-5 text-lg bg-white/50 border border-slate-200/50 rounded-2xl focus-ring placeholder-slate-400 backdrop-blur-sm"
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center w-14 h-6">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <span>Search</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Example Queries */}
        {!hasSearched && !isLoading && (
          <div className="max-w-5xl mx-auto mb-16 animate-fade-in">
            <h3 className="text-2xl font-semibold text-slate-800 text-center mb-8">
              Try these popular searches
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(example.query);
                    searchProfiles(example.query);
                  }}
                  className="group p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-black/10 text-left"
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                      {example.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {example.title}
                      </div>
                      <div className="text-sm text-slate-500 truncate">
                        {example.subtitle}
                      </div>
                    </div>
                    <div className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        {(isLoading || hasSearched) && (
          <div className="animate-fade-in">
            {isLoading ? (
              <div className="max-w-4xl mx-auto">
                <div className="card-modern p-12 text-center">
                  <div className="inline-flex items-center gap-4 mb-6">
                    <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-xl font-medium text-slate-700">Finding your perfect matches...</span>
                  </div>

                  <div className="space-y-3 max-w-md mx-auto">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Analyzing your musical preferences</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>Searching NYC musician database</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <span>Calculating compatibility scores</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Results Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">
                      Search Results
                    </h2>
                    <p className="text-slate-600">
                      Found {profiles.length} musician{profiles.length !== 1 ? 's' : ''} • Sorted by compatibility
                    </p>
                  </div>

                  {/* Query Summary */}
                  {aiParsing && (
                    <div className="card-glass p-4 max-w-md">
                      <div className="text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Understanding ({Math.round(aiParsing.confidence * 100)}% confidence)
                      </div>
                      <div className="text-sm text-white/80">
                        Looking for {aiParsing.parsed_query.instruments?.join(', ')} players
                        {aiParsing.parsed_query.location && ` in ${aiParsing.parsed_query.location}`}
                        {aiParsing.parsed_query.collaboration_intent && ` for ${aiParsing.parsed_query.collaboration_intent}`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error State */}
                {hasError && (
                  <div className="text-center py-16">
                    <div className="card-modern p-12 max-w-md mx-auto">
                      <div className="text-6xl mb-4">⚠️</div>
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        Search Error
                      </h3>
                      <p className="text-slate-500 mb-6">
                        {error}
                      </p>
                      <button
                        onClick={() => {
                          clearSearch();
                        }}
                        className="btn-primary"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Results Grid */}
                {hasResults && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {profiles.map((profile, index) => (
                      <Link
                        key={profile.id}
                        href={`/profile/${profile.id}`}
                        className="group card-modern p-6 hover:-translate-y-2 cursor-pointer block"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {/* Rank Badge */}
                        {index < 3 && (
                          <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            #{index + 1}
                          </div>
                        )}

                        {/* Profile Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            {profile.avatar ? (
                              <img
                                src={profile.avatar}
                                alt={profile.name}
                                className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                              />
                            ) : (
                              <div className={`w-14 h-14 bg-gradient-to-br ${getAvatarGradient(profile.name)} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                {getInitials(profile.name)}
                              </div>
                            )}
                            <div>
                              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {profile.name}
                              </h3>
                              <div className="flex items-center gap-1 text-sm text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {profile.location}
                              </div>
                            </div>
                          </div>

                          {/* Match Score */}
                          {profile.compatibility_score && (
                            <div className={`px-3 py-1 rounded-full text-white font-semibold text-sm bg-gradient-to-r ${getScoreColor(profile.compatibility_score * 100)} shadow-lg`}>
                              {Math.round(profile.compatibility_score * 100)}% match
                            </div>
                          )}
                        </div>

                        {/* Instruments */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {profile.instruments.map((instrument, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                              >
                                {instrument}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Match Highlights */}
                        {aiParsing && (
                          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <div className="text-sm font-medium text-emerald-800 mb-1 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Perfect Match
                            </div>
                            <div className="text-sm text-emerald-700">
                              {aiParsing.parsed_query.instruments && profile.instruments.some(inst =>
                                aiParsing.parsed_query.instruments!.some(queryInst =>
                                  inst.toLowerCase().includes(queryInst.toLowerCase())
                                )
                              ) && `🎸 ${profile.instruments.join(', ')}`}
                            </div>
                          </div>
                        )}

                        {/* Profile Details */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Genres</span>
                            <span className="text-sm text-slate-800">{profile.genres.join(', ')}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Experience</span>
                            <span className="text-sm text-slate-800 capitalize">{profile.experience_level}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Collaboration</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                              {profile.collaboration_intent}
                            </span>
                          </div>
                        </div>

                        {/* Bio */}
                        {profile.bio && (
                          <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">
                            "{profile.bio}"
                          </p>
                        )}

                        {/* View Profile Button */}
                        <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 group text-center">
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>View Profile</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {isEmpty && (
                  <div className="text-center py-16">
                    <div className="card-modern p-12 max-w-md mx-auto">
                      <div className="text-6xl mb-4">🎵</div>
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        No musicians found
                      </h3>
                      <p className="text-slate-500 mb-6">
                        Try adjusting your search terms or explore different instruments and locations.
                      </p>
                      <button
                        onClick={() => {
                          clearSearch();
                        }}
                        className="btn-primary"
                      >
                        Start New Search
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}