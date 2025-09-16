import React from 'react';

export default function LoadingOverlay({ visible }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl shadow-xl flex items-center space-x-4">
        {/* Spinner */}
        <svg
          className="animate-spin h-6 w-6 text-gray-700"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>

        {/* Text */}
        <div className="h-6 text-lg font-semibold">Processing, please wait...</div>
      </div>
    </div>
  );
}
