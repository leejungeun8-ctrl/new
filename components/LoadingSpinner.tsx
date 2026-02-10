
import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
      <p className="text-slate-500 font-medium">잠시만 기다려주세요...</p>
    </div>
  );

  if (fullScreen) {
    return <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">{content}</div>;
  }

  return <div className="py-12 flex items-center justify-center">{content}</div>;
};

export default LoadingSpinner;
