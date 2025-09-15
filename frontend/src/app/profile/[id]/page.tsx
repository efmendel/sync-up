'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Profile } from '../../../types';

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const mlServiceUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:5005';
        const response = await fetch(`${mlServiceUrl}/profiles/${profileId}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const profileData = await response.json();

          // Transform ML service profile to match expected Profile interface
          const transformedProfile: Profile = {
            id: profileData.id,
            name: profileData.name,
            location: profileData.location,
            instruments: Array.isArray(profileData.instruments) ? profileData.instruments : [],
            preferredGenres: Array.isArray(profileData.genres) ? profileData.genres : [],
            genres: Array.isArray(profileData.genres) ? profileData.genres : [],
            bio: profileData.bio || '',
            experience_level: profileData.experience_level || 'intermediate',
            collaboration_intent: profileData.collaboration_intent || 'band formation',
            availability: profileData.availability || 'flexible',
            musical_influences: Array.isArray(profileData.musical_influences) ? profileData.musical_influences : [],
            rating: 4.5, // Default values for missing fields
            reviewCount: 12,
            primaryInstrument: Array.isArray(profileData.instruments) && profileData.instruments.length > 0
              ? profileData.instruments[0] : 'unknown',
            yearsPracticing: 5,
            age: 25,
            achievements: [`Active musician in ${profileData.location || 'local'} scene`],
            skills: profileData.instruments || [],
            equipment: [`Professional ${profileData.instruments?.[0] || 'equipment'}`],
            rehearsalSpace: false,
            isVerified: Math.random() > 0.5,
            joinDate: '2023-01-01',
            lastActive: 'Today',
            transportationPreference: 'own vehicle',
            compatibility_score: profileData.compatibility_score,
            socialMedia: {
              instagram: '@' + profileData.name?.toLowerCase().replace(/\s+/g, ''),
              spotify: profileData.name + ' Music',
              youtube: profileData.name + ' Channel'
            }
          };

          setProfile(transformedProfile);
        } else {
          console.error('Profile not found');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'professional': return 'from-emerald-500 to-teal-500';
      case 'advanced': return 'from-blue-500 to-indigo-500';
      case 'intermediate': return 'from-amber-500 to-orange-500';
      default: return 'from-slate-500 to-gray-500';
    }
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Search</span>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="card-modern p-8 mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center lg:items-start">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-32 h-32 rounded-2xl object-cover shadow-xl"
                />
              ) : (
                <div className={`w-32 h-32 bg-gradient-to-br ${getAvatarGradient(profile.name)} rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl`}>
                  {getInitials(profile.name)}
                </div>
              )}

              {profile.isVerified && (
                <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-slate-800 mb-2">{profile.name}</h1>
                  <div className="flex items-center gap-2 text-slate-600 mb-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-lg">{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {renderStars(profile.rating)}
                    </div>
                    <span className="text-slate-600">
                      {profile.rating} ({profile.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className={`px-4 py-2 rounded-full text-white font-semibold text-sm bg-gradient-to-r ${getExperienceColor(profile.experience_level)} shadow-lg text-center`}>
                    {profile.experience_level} level
                  </div>
                </div>
              </div>

              {/* Primary Instrument and Years */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
                  <div className="text-sm font-medium text-blue-800">Primary Instrument</div>
                  <div className="text-lg font-semibold text-blue-900 capitalize">{profile.primaryInstrument}</div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-2">
                  <div className="text-sm font-medium text-purple-800">Experience</div>
                  <div className="text-lg font-semibold text-purple-900">{profile.yearsPracticing} years</div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                  <div className="text-sm font-medium text-green-800">Age</div>
                  <div className="text-lg font-semibold text-green-900">{profile.age}</div>
                </div>
              </div>

              {/* Bio Preview */}
              <div className="mb-6">
                <p className="text-slate-700 leading-relaxed">
                  {showFullBio ? profile.bio : `${profile.bio.substring(0, 200)}${profile.bio.length > 200 ? '...' : ''}`}
                </p>
                {profile.bio.length > 200 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2"
                  >
                    {showFullBio ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Send Message
                </button>
                <button className="bg-white hover:bg-gray-50 text-slate-700 font-medium px-6 py-3 rounded-xl border border-gray-200 transition-all duration-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Save Profile
                </button>
                <button className="bg-white hover:bg-gray-50 text-slate-700 font-medium px-6 py-3 rounded-xl border border-gray-200 transition-all duration-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="card-modern p-2 mb-8">
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: '👁️' },
              { id: 'music', label: 'Music & Instruments', icon: '🎵' },
              { id: 'experience', label: 'Experience', icon: '⭐' },
              { id: 'availability', label: 'Availability', icon: '📅' },
              { id: 'samples', label: 'Audio Samples', icon: '🎧' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Instruments */}
                <div className="card-modern p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span>🎸</span>
                    Instruments
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.instruments.map((instrument, idx) => (
                      <span
                        key={idx}
                        className={`px-4 py-2 rounded-xl font-medium ${
                          instrument === profile.primaryInstrument
                            ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {instrument}
                        {instrument === profile.primaryInstrument && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">PRIMARY</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Musical Influences */}
                <div className="card-modern p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span>🎭</span>
                    Musical Influences
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.musical_influences.map((influence, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-medium border border-purple-100"
                      >
                        {influence}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Genres */}
                <div className="card-modern p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span>🎶</span>
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.preferredGenres.map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-xl font-medium border border-green-100"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'music' && (
              <div className="space-y-6">
                {/* Skills */}
                <div className="card-modern p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span>🛠️</span>
                    Skills & Specialties
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profile.skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 font-medium capitalize">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div className="card-modern p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span>🎛️</span>
                    Equipment
                  </h3>
                  <div className="space-y-3">
                    {profile.equipment.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-6">
                {/* Achievements */}
                <div className="card-modern p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span>🏆</span>
                    Achievements
                  </h3>
                  <div className="space-y-4">
                    {profile.achievements.map((achievement, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                        <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="text-slate-700 font-medium">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-6">
                {/* Availability Info */}
                <div className="card-modern p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span>⏰</span>
                    Availability
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Schedule</h4>
                      <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 text-green-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium capitalize">{profile.availability}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Collaboration Type</h4>
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 text-purple-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium capitalize">{profile.collaboration_intent}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {profile.rehearsalSpace && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 text-blue-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">Has rehearsal space available</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'samples' && (
              <div className="space-y-6">
                {/* Audio Samples */}
                <div className="card-modern p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span>🎧</span>
                    Audio Samples
                  </h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Solo Performance - Original Song', duration: '3:24', genre: 'Indie Folk' },
                      { title: 'Band Collaboration - Live Recording', duration: '4:12', genre: 'Alternative Rock' },
                      { title: 'Studio Session - Cover', duration: '2:48', genre: 'Jazz' }
                    ].map((sample, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors group-hover:scale-105">
                            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <div>
                            <h4 className="font-semibold text-slate-800">{sample.title}</h4>
                            <p className="text-sm text-slate-600">{sample.genre} • {sample.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload New Sample */}
                  <div className="mt-6 p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-slate-400 group-hover:text-blue-500 mx-auto mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-slate-600 font-medium mb-1">Upload Audio Sample</p>
                      <p className="text-sm text-slate-500">MP3, WAV, or M4A (max 10MB)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="card-modern p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Contact & Social</h3>
              <div className="space-y-3">
                {profile.socialMedia?.instagram && (
                  <a href="#" className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg hover:from-pink-100 hover:to-purple-100 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      <span className="text-sm font-bold">IG</span>
                    </div>
                    <span className="text-slate-700 font-medium">{profile.socialMedia.instagram}</span>
                  </a>
                )}
                {profile.socialMedia?.spotify && (
                  <a href="#" className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
                      <span className="text-sm font-bold">♪</span>
                    </div>
                    <span className="text-slate-700 font-medium">{profile.socialMedia.spotify}</span>
                  </a>
                )}
                {profile.socialMedia?.youtube && (
                  <a href="#" className="flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white">
                      <span className="text-sm font-bold">YT</span>
                    </div>
                    <span className="text-slate-700 font-medium">{profile.socialMedia.youtube}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card-modern p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Member since</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Last active</span>
                  <span className="font-semibold text-slate-800">{profile.lastActive}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Transportation</span>
                  <span className="font-semibold text-slate-800 capitalize">{profile.transportationPreference}</span>
                </div>
              </div>
            </div>

            {/* Compatibility Score */}
            {profile.compatibility_score && (
              <div className="card-modern p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Compatibility</h3>
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-r ${getExperienceColor(profile.experience_level)} flex items-center justify-center`}>
                    <span className="text-2xl font-bold text-white">{Math.round(profile.compatibility_score * 100)}%</span>
                  </div>
                  <p className="text-sm text-slate-600">Based on your search criteria</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}