import React from 'react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
      <div className="loading-dots flex">
        <span className="w-3 h-3 bg-primary rounded-full mx-1"></span>
        <span className="w-3 h-3 bg-primary rounded-full mx-1"></span>
        <span className="w-3 h-3 bg-primary rounded-full mx-1"></span>
      </div>
    </div>
  );
};
