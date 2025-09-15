'use client';

export default function LoadingSpinner() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl">
      <div className="flex flex-col items-center justify-center py-16 space-y-5">
        <div className="w-10 h-10 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="text-gray-600 text-lg font-medium">
          🔍 Searching for musicians...
        </div>
      </div>
    </div>
  );
}