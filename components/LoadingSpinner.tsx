import React from 'react';
import { Icon } from './Icon';

interface LoadingSpinnerProps {
  title?: string;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  title = "Analyzing Garment...", 
  message = "Our AI is taking a close look. This might take a moment." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="animate-spin text-[#7FE5D2]">
        <Icon name="loader" size={48} />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-gray-800">{title}</h2>
      <p className="mt-2 text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;