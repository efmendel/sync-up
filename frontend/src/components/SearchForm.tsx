'use client';

import { useState } from 'react';
import { SearchFormProps } from '../types';

const EXAMPLE_QUERIES = [
  {
    text: 'Female vocalist in Brooklyn',
    query: 'find a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse'
  },
  {
    text: 'Bass player in Williamsburg',
    query: 'looking for a bass player in williamsburg for session work, preferably someone who sounds like flea'
  },
  {
    text: 'Drummer for indie band in LES',
    query: 'drummer needed for indie rock band in lower east side, must be available 3 times a week'
  },
  {
    text: 'Keyboardist for church in Brooklyn',
    query: 'seeking a keyboardist for church services in brooklyn every wednesday'
  },
  {
    text: 'Jazz guitarist in Astoria',
    query: 'guitarist in astoria who plays jazz and is available for recording sessions'
  }
];

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const setExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="bg-white rounded-2xl p-8 mb-8 shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex gap-3 items-stretch">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'find a female vocalist in brooklyn who rehearses twice a week and sings like amy winehouse'"
            className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-full text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg"
            autoFocus
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none px-6 py-4 rounded-full text-base font-semibold cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
          >
            {isLoading ? '🔍 Searching...' : '🔍 Find Musicians'}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-gray-600 mb-3 text-sm font-medium">
            💡 Try these natural language searches:
          </h4>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setExampleQuery(example.query)}
                className="bg-gray-100 text-blue-600 px-3 py-2 rounded-full text-xs cursor-pointer transition-colors duration-200 hover:bg-blue-50 border-none"
                disabled={isLoading}
              >
                {example.text}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}