import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mb-4"></div>
        <p className="text-zinc-400 mt-4">Loading your proposal...</p>
      </div>
    </div>
  );
};

export default LoadingState;
