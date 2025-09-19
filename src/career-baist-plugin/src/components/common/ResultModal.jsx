import React from 'react';

export default function ResultModal({ visible, resultText, onClose }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="mb-4 font-semibold text-lg">Optimization Result</h2>
        <textarea
          className="w-full p-2 border rounded resize-none h-[300px]"
          readOnly
          value={resultText}
        />
        <div class="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-xl bg-green-600 text-white font-bold hover:bg-green-700 w-1/4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
