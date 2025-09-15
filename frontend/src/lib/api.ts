// API client with error handling, caching, and retry logic
import { useState, useEffect } from 'react';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class ApiClient {
  private baseUrl: string;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }

  private getCacheKey(url: string, params?: Record<string, any>): string {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return `${url}${queryString ? '?' + queryString : ''}`;
  }

  private isValidCache(item: { timestamp: number; ttl: number }): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    attempt = 1
  ): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheTtl?: number
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(url, options.method === 'GET' ? options : undefined);

    // Check cache for GET requests
    if (options.method === 'GET' || !options.method) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isValidCache(cached)) {
        return cached.data;
      }
    }

    try {
      const response = await this.fetchWithRetry(url, options);
      const data = await response.json();

      // Cache successful GET responses
      if (cacheTtl && (options.method === 'GET' || !options.method)) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTtl
        });
      }

      return data;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.message || 'Network error occurred',
        status: error.status || 0,
        code: error.code
      };
      throw apiError;
    }
  }

  // Search APIs
  async searchMusicians(params: {
    q?: string;
    instruments?: string[];
    genres?: string[];
    location?: string;
    availability?: string;
    experienceLevel?: string;
    collaborationType?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    users: any[];
    pagination: any;
    searchQuery: any;
  }> {
    const searchParams = new URLSearchParams();

    if (params.q) searchParams.append('q', params.q);
    if (params.instruments?.length) searchParams.append('instruments', params.instruments.join(','));
    if (params.genres?.length) searchParams.append('genres', params.genres.join(','));
    if (params.location) searchParams.append('location', params.location);
    if (params.availability) searchParams.append('availability', params.availability);
    if (params.experienceLevel) searchParams.append('experienceLevel', params.experienceLevel);
    if (params.collaborationType) searchParams.append('collaborationType', params.collaborationType);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const cacheTtl = parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300000');
    return this.request(`/search?${searchParams.toString()}`, {}, cacheTtl);
  }

  async getSearchSuggestions(type: 'all' | 'instruments' | 'genres' | 'locations' | 'experienceLevels' | 'collaborationTypes' = 'all'): Promise<{
    instruments?: string[];
    genres?: string[];
    locations?: string[];
    experienceLevels?: string[];
    collaborationTypes?: string[];
  }> {
    const cacheTtl = parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300000');
    return this.request(`/search/suggestions?type=${type}`, {}, cacheTtl);
  }

  async searchNearby(params: {
    location: string;
    radius?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    users: any[];
    pagination: any;
    searchQuery: any;
  }> {
    const searchParams = new URLSearchParams();
    searchParams.append('location', params.location);
    if (params.radius) searchParams.append('radius', params.radius.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const cacheTtl = parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300000');
    return this.request(`/search/nearby?${searchParams.toString()}`, {}, cacheTtl);
  }

  // User APIs
  async getUser(id: string): Promise<any> {
    const cacheTtl = parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300000');
    return this.request(`/users/${id}`, {}, cacheTtl);
  }

  async getAllUsers(params: { page?: number; limit?: number } = {}): Promise<{
    users: any[];
    pagination: any;
  }> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const cacheTtl = parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300000');
    return this.request(`/users?${searchParams.toString()}`, {}, cacheTtl);
  }

  async createUser(userData: any): Promise<any> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id: string, userData: any): Promise<any> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number }> {
    return this.request('/health');
  }

  // Clear cache
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// AI-powered query parsing
export class AIQueryParser {
  private mlServiceUrl: string;

  constructor() {
    this.mlServiceUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:5000';
  }

  async parseQuery(query: string): Promise<{
    parsed_query: any;
    confidence: number;
    suggestions?: string[];
  }> {
    try {
      const response = await fetch(`${this.mlServiceUrl}/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`ML Service error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.warn('AI query parsing failed, using fallback:', error);
      return this.fallbackParse(query);
    }
  }

  private fallbackParse(query: string): { parsed_query: any; confidence: number } {
    const queryLower = query.toLowerCase();
    const parsed: any = {};

    // Extract instruments
    const instruments = [];
    const instrumentKeywords = [
      'guitar', 'guitarist', 'bass', 'bassist', 'drums', 'drummer',
      'piano', 'pianist', 'vocals', 'vocalist', 'singer', 'violin',
      'violinist', 'saxophone', 'sax', 'trumpet', 'cello'
    ];

    for (const instrument of instrumentKeywords) {
      if (queryLower.includes(instrument)) {
        instruments.push(instrument.replace(/ist$/, '').replace(/er$/, ''));
      }
    }
    if (instruments.length > 0) parsed.instruments = [...new Set(instruments)];

    // Extract locations
    const locations = ['brooklyn', 'manhattan', 'queens', 'bronx', 'williamsburg', 'astoria'];
    for (const location of locations) {
      if (queryLower.includes(location)) {
        parsed.location = location;
        break;
      }
    }

    // Extract collaboration types
    if (queryLower.includes('band') || queryLower.includes('group')) {
      parsed.collaborationType = 'band formation';
    } else if (queryLower.includes('session')) {
      parsed.collaborationType = 'session work';
    } else if (queryLower.includes('duo')) {
      parsed.collaborationType = 'duo collaboration';
    }

    // Extract experience levels
    if (queryLower.includes('professional') || queryLower.includes('pro')) {
      parsed.experienceLevel = 'professional';
    } else if (queryLower.includes('beginner')) {
      parsed.experienceLevel = 'beginner';
    } else if (queryLower.includes('intermediate')) {
      parsed.experienceLevel = 'intermediate';
    }

    return {
      parsed_query: parsed,
      confidence: 0.7 // Medium confidence for fallback parsing
    };
  }
}

// Debounced search hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Create singleton instances
export const apiClient = new ApiClient();
export const aiParser = new AIQueryParser();