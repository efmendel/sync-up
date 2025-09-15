import { useState, useEffect, useCallback } from 'react';
import { apiClient, aiParser, useDebounce, ApiError } from '../lib/api';
import { Profile, ParsedQuery } from '../types';

interface SearchResult {
  users: Profile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  aiParsing?: {
    original_query: string;
    parsed_query: ParsedQuery;
    confidence: number;
    timestamp: string;
  };
  searchQuery: any;
}

interface UseSearchOptions {
  enableDebounce?: boolean;
  debounceDelay?: number;
  useAI?: boolean;
  autoSearch?: boolean;
}

export function useSearch(options: UseSearchOptions = {}) {
  const {
    enableDebounce = true,
    debounceDelay = parseInt(process.env.NEXT_PUBLIC_DEBOUNCE_DELAY || '300'),
    useAI = true,
    autoSearch = false
  } = options;

  // State
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced query for auto-search
  const debouncedQuery = useDebounce(query, debounceDelay);

  // Search function
  const performSearch = useCallback(async (searchQuery: string, options: {
    page?: number;
    limit?: number;
    useAI?: boolean;
  } = {}) => {
    if (!searchQuery.trim()) {
      setResults(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      let searchResult: SearchResult;

      if (options.useAI ?? useAI) {
        // Use ML service directly for AI-powered search
        const mlServiceUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL;
        if (!mlServiceUrl) {
          throw new Error('ML Service URL not configured. Please check your environment variables.');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
          const response = await fetch(`${mlServiceUrl}/match`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query: searchQuery,
              limit: options.limit || 20,
              min_compatibility: 0.3  // Lower threshold for more results
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Search service not available. Please try again later.');
            } else if (response.status === 500) {
              throw new Error('Server error occurred. Please try again.');
            } else if (response.status === 429) {
              throw new Error('Too many requests. Please wait a moment and try again.');
            } else {
              throw new Error(`Search failed: ${response.status} ${response.statusText}`);
            }
          }

          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid response format from server.');
          }

          const mlResponse = await response.json();

          // Validate response structure
          if (!mlResponse || typeof mlResponse !== 'object') {
            throw new Error('Invalid search results format.');
          }

          // Transform ML service response to match frontend expectations
          searchResult = {
            users: Array.isArray(mlResponse.matches) ? mlResponse.matches.map((match: any) => ({
              ...match.profile,
              compatibility_score: match.compatibility_score
            })) : [],
            pagination: {
              page: 1,
              limit: options.limit || 20,
              total: mlResponse.total_found || 0,
              totalPages: Math.ceil((mlResponse.total_found || 0) / (options.limit || 20)),
              hasNext: false,
              hasPrev: false
            },
            aiParsing: mlResponse.parsed_query ? {
              original_query: searchQuery,
              parsed_query: mlResponse.parsed_query,
              confidence: typeof mlResponse.parsed_query.confidence === 'string'
                ? (mlResponse.parsed_query.confidence === 'high' ? 90 :
                   mlResponse.parsed_query.confidence === 'medium' ? 70 : 50)
                : (mlResponse.parsed_query.confidence || 0),
              timestamp: new Date().toISOString()
            } : undefined,
            searchQuery: mlResponse.parsed_query || { original_query: searchQuery }
          };

        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error('Search request timed out. Please try again.');
          }
          throw fetchError;
        }
      } else {
        // Use basic search with error handling
        try {
          searchResult = await apiClient.searchMusicians({
            q: searchQuery,
            page: options.page || 1,
            limit: options.limit || 20
          });
        } catch (apiError: any) {
          if (apiError.status === 0) {
            throw new Error('Unable to connect to the server. Please check your internet connection.');
          }
          throw apiError;
        }
      }

      setResults(searchResult);
    } catch (err: any) {
      let errorMessage = 'Search failed. Please try again.';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.status >= 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (err.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }

      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [useAI]);

  // Manual search trigger
  const search = useCallback((searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    return performSearch(queryToSearch);
  }, [query, performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
    setHasSearched(false);
  }, []);

  // Load more results (pagination)
  const loadMore = useCallback(async (page: number) => {
    if (!results || isLoading) return;

    setIsLoading(true);
    try {
      const searchResult = await performSearch(query, {
        page,
        limit: results.pagination.limit
      });

      if (searchResult) {
        setResults(prev => prev ? {
          ...searchResult,
          users: page === 1 ? searchResult.users : [...prev.users, ...searchResult.users]
        } : searchResult);
      }
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [results, query, performSearch, isLoading]);

  // Auto-search with debounced query
  useEffect(() => {
    if (autoSearch && debouncedQuery && enableDebounce) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery, autoSearch, enableDebounce, performSearch]);

  // Search suggestions
  const [suggestions, setSuggestions] = useState<{
    instruments?: string[];
    genres?: string[];
    locations?: string[];
  }>({});

  const loadSuggestions = useCallback(async () => {
    try {
      const suggestionData = await apiClient.getSearchSuggestions();
      setSuggestions(suggestionData);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  }, []);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  // Calculate computed values before return
  const hasResults = (results?.users.length || 0) > 0;
  const hasError = !!error;

  return {
    // State
    query,
    setQuery,
    isLoading,
    results,
    error,
    hasSearched,
    suggestions,

    // Actions
    search,
    clearSearch,
    loadMore,
    loadSuggestions,

    // Computed
    profiles: results?.users || [],
    pagination: results?.pagination,
    aiParsing: results?.aiParsing,
    totalResults: results?.pagination.total || 0,
    hasResults,
    hasError,
    isEmpty: hasSearched && !isLoading && !hasResults && !error
  };
}

// Hook for AI query parsing only
export function useQueryParser() {
  const [isParsing, setIsParsing] = useState(false);
  const [lastParsed, setLastParsed] = useState<{
    query: string;
    result: any;
  } | null>(null);

  const parseQuery = useCallback(async (query: string) => {
    if (!query.trim()) return null;

    setIsParsing(true);
    try {
      const result = await aiParser.parseQuery(query);
      setLastParsed({ query, result });
      return result;
    } catch (error) {
      console.error('Query parsing failed:', error);
      return null;
    } finally {
      setIsParsing(false);
    }
  }, []);

  return {
    parseQuery,
    isParsing,
    lastParsed,
    clearParsed: () => setLastParsed(null)
  };
}

// Hook for search history
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    setHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      return [query, ...filtered].slice(0, 10); // Keep last 10 searches
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => prev.filter(item => item !== query));
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('syncup-search-history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // Save to localStorage when history changes
  useEffect(() => {
    try {
      localStorage.setItem('syncup-search-history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
}