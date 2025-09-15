'use client';

interface LoadingStateProps {
  message?: string;
  showProgress?: boolean;
}

export default function LoadingState({ message = "Searching for musicians...", showProgress = true }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      {/* Animated music note spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl animate-pulse">🎵</span>
        </div>
      </div>

      {/* Loading message */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-700">{message}</h3>
        <p className="text-sm text-gray-500">Finding your perfect musical collaborators...</p>
      </div>

      {/* Progress indicators */}
      {showProgress && (
        <div className="space-y-3 w-full max-w-md">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Parsing your query with AI...</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <span className="text-sm text-gray-600">Searching musician database...</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <span className="text-sm text-gray-600">Calculating compatibility scores...</span>
          </div>
        </div>
      )}

      {/* Animated bars */}
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 bg-gradient-to-t from-blue-400 to-purple-500 rounded-full animate-pulse"
            style={{
              height: `${Math.random() * 20 + 10}px`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.5s'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

// Skeleton loading for profile cards
export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-14"></div>
          </div>
        </div>

        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 rounded-full w-12"></div>
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-18"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>

        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}