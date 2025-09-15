'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { demoProfiles, getProfileAvatar } from '../../../data/demoProfiles';
import { Profile } from '../../../types';

export default function EditProfilePage() {
  // For demo purposes, we'll edit the first profile
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load first profile for demo
    const demoProfile = { ...demoProfiles[0], avatar: getProfileAvatar(demoProfiles[0].id) };
    setProfile(demoProfile);
  }, []);

  const handleInputChange = (field: keyof Profile, value: any) => {
    if (!profile) return;

    setProfile(prev => prev ? { ...prev, [field]: value } : null);
    setUnsavedChanges(true);
  };

  const handleArrayInputChange = (field: keyof Profile, index: number, value: string) => {
    if (!profile) return;

    const currentArray = profile[field] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;

    setProfile(prev => prev ? { ...prev, [field]: newArray } : null);
    setUnsavedChanges(true);
  };

  const addArrayItem = (field: keyof Profile, defaultValue: string = '') => {
    if (!profile) return;

    const currentArray = (profile[field] as string[]) || [];
    const newArray = [...currentArray, defaultValue];

    setProfile(prev => prev ? { ...prev, [field]: newArray } : null);
    setUnsavedChanges(true);
  };

  const removeArrayItem = (field: keyof Profile, index: number) => {
    if (!profile) return;

    const currentArray = profile[field] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);

    setProfile(prev => prev ? { ...prev, [field]: newArray } : null);
    setUnsavedChanges(true);
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    if (!profile) return;

    setProfile(prev => prev ? {
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    } : null);
    setUnsavedChanges(true);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && profile) {
      // In a real app, this would upload to a server
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfile(prev => prev ? { ...prev, avatar: e.target?.result as string } : null);
          setUnsavedChanges(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Simulate API save
    setTimeout(() => {
      setShowSuccessMessage(true);
      setUnsavedChanges(false);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }, 500);
  };

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-400',
      'from-yellow-400 to-orange-400'
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/profile/${profile.id}`}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Profile</span>
            </Link>
            <div className="w-px h-6 bg-slate-300"></div>
            <h1 className="text-2xl font-bold text-slate-800">Edit Profile</h1>
          </div>

          <div className="flex items-center gap-3">
            {unsavedChanges && (
              <span className="text-amber-600 text-sm font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!unsavedChanges}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-medium">Profile updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card-modern p-6 sticky top-8">
              <h3 className="font-bold text-slate-800 mb-4">Edit Sections</h3>
              <nav className="space-y-2">
                {[
                  { id: 'basic', label: 'Basic Info', icon: '👤' },
                  { id: 'music', label: 'Music & Skills', icon: '🎵' },
                  { id: 'experience', label: 'Experience', icon: '⭐' },
                  { id: 'social', label: 'Social Media', icon: '📱' },
                  { id: 'preferences', label: 'Preferences', icon: '⚙️' }
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card-modern p-8">
              {activeSection === 'basic' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Basic Information</h2>

                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className={`w-24 h-24 bg-gradient-to-br ${getAvatarGradient(profile.name)} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                          {getInitials(profile.name)}
                        </div>
                      )}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Profile Photo</h3>
                      <p className="text-sm text-slate-600 mb-3">Upload a professional photo that represents you as a musician.</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Choose Photo
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring"
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring"
                      placeholder="Neighborhood, Borough"
                    />
                  </div>

                  {/* Age */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
                      <input
                        type="number"
                        value={profile.age}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring"
                        placeholder="Your age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Years Playing Music</label>
                      <input
                        type="number"
                        value={profile.yearsPracticing}
                        onChange={(e) => handleInputChange('yearsPracticing', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring"
                        placeholder="Years of experience"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring resize-none"
                      placeholder="Tell other musicians about yourself, your musical journey, and what you're looking for..."
                    />
                    <div className="mt-1 text-sm text-slate-500">
                      {profile.bio.length}/500 characters
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'music' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Music & Skills</h2>

                  {/* Primary Instrument */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Primary Instrument</label>
                    <select
                      value={profile.primaryInstrument}
                      onChange={(e) => handleInputChange('primaryInstrument', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring"
                    >
                      <option value="">Select primary instrument</option>
                      {['vocals', 'guitar', 'bass', 'drums', 'piano', 'violin', 'saxophone', 'trumpet', 'cello', 'flute'].map(instrument => (
                        <option key={instrument} value={instrument}>{instrument}</option>
                      ))}
                    </select>
                  </div>

                  {/* All Instruments */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">All Instruments</label>
                      <button
                        onClick={() => addArrayItem('instruments')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Instrument
                      </button>
                    </div>
                    <div className="space-y-2">
                      {profile.instruments.map((instrument, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={instrument}
                            onChange={(e) => handleArrayInputChange('instruments', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus-ring"
                            placeholder="Instrument name"
                          />
                          <button
                            onClick={() => removeArrayItem('instruments', index)}
                            className="w-8 h-8 text-red-600 hover:text-red-700 flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Genres */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">Preferred Genres</label>
                      <button
                        onClick={() => addArrayItem('preferredGenres')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Genre
                      </button>
                    </div>
                    <div className="space-y-2">
                      {profile.preferredGenres.map((genre, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={genre}
                            onChange={(e) => handleArrayInputChange('preferredGenres', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus-ring"
                            placeholder="Genre name"
                          />
                          <button
                            onClick={() => removeArrayItem('preferredGenres', index)}
                            className="w-8 h-8 text-red-600 hover:text-red-700 flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">Skills & Specialties</label>
                      <button
                        onClick={() => addArrayItem('skills')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Skill
                      </button>
                    </div>
                    <div className="space-y-2">
                      {profile.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={skill}
                            onChange={(e) => handleArrayInputChange('skills', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus-ring"
                            placeholder="Skill or specialty"
                          />
                          <button
                            onClick={() => removeArrayItem('skills', index)}
                            className="w-8 h-8 text-red-600 hover:text-red-700 flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Musical Influences */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">Musical Influences</label>
                      <button
                        onClick={() => addArrayItem('musical_influences')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Influence
                      </button>
                    </div>
                    <div className="space-y-2">
                      {profile.musical_influences.map((influence, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={influence}
                            onChange={(e) => handleArrayInputChange('musical_influences', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus-ring"
                            placeholder="Artist or band name"
                          />
                          <button
                            onClick={() => removeArrayItem('musical_influences', index)}
                            className="w-8 h-8 text-red-600 hover:text-red-700 flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'experience' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Experience & Achievements</h2>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Experience Level</label>
                    <select
                      value={profile.experience_level}
                      onChange={(e) => handleInputChange('experience_level', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>


                  {/* Achievements */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">Achievements & Credits</label>
                      <button
                        onClick={() => addArrayItem('achievements')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Achievement
                      </button>
                    </div>
                    <div className="space-y-2">
                      {profile.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={achievement}
                            onChange={(e) => handleArrayInputChange('achievements', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus-ring"
                            placeholder="Achievement or credit"
                          />
                          <button
                            onClick={() => removeArrayItem('achievements', index)}
                            className="w-8 h-8 text-red-600 hover:text-red-700 flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'social' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Social Media & Links</h2>

                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Instagram</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                      <input
                        type="text"
                        value={profile.socialMedia?.instagram || ''}
                        onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus-ring"
                        placeholder="your_username"
                      />
                    </div>
                  </div>

                  {/* Spotify */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Spotify Artist Name</label>
                    <input
                      type="text"
                      value={profile.socialMedia?.spotify || ''}
                      onChange={(e) => handleSocialMediaChange('spotify', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring"
                      placeholder="Artist name on Spotify"
                    />
                  </div>

                  {/* YouTube */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">YouTube Channel</label>
                    <input
                      type="text"
                      value={profile.socialMedia?.youtube || ''}
                      onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring"
                      placeholder="Channel name or URL"
                    />
                  </div>

                  {/* SoundCloud */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">SoundCloud</label>
                    <input
                      type="text"
                      value={profile.socialMedia?.soundcloud || ''}
                      onChange={(e) => handleSocialMediaChange('soundcloud', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring"
                      placeholder="SoundCloud username"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Preferences & Availability</h2>

                  {/* Collaboration Intent */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Collaboration Type</label>
                    <select
                      value={profile.collaboration_intent}
                      onChange={(e) => handleInputChange('collaboration_intent', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring"
                    >
                      <option value="band formation">Band Formation</option>
                      <option value="session work">Session Work</option>
                      <option value="duo collaboration">Duo Collaboration</option>
                      <option value="jamming">Casual Jamming</option>
                      <option value="teaching">Teaching/Lessons</option>
                      <option value="recording projects">Recording Projects</option>
                    </select>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                    <select
                      value={profile.availability}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring"
                    >
                      <option value="weekends only">Weekends Only</option>
                      <option value="evenings only">Evenings Only</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="twice a week">Twice a Week</option>
                      <option value="three times a week">Three Times a Week</option>
                      <option value="flexible schedule">Flexible Schedule</option>
                    </select>
                  </div>

                  {/* Transportation */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Transportation Preference</label>
                    <select
                      value={profile.transportationPreference}
                      onChange={(e) => handleInputChange('transportationPreference', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus-ring"
                    >
                      <option value="subway">Subway</option>
                      <option value="bike">Bike</option>
                      <option value="car">Car</option>
                      <option value="walking">Walking</option>
                      <option value="rideshare">Rideshare</option>
                    </select>
                  </div>

                  {/* Rehearsal Space */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="rehearsalSpace"
                      checked={profile.rehearsalSpace || false}
                      onChange={(e) => handleInputChange('rehearsalSpace', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="rehearsalSpace" className="text-sm font-medium text-slate-700">
                      I have access to rehearsal space
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}