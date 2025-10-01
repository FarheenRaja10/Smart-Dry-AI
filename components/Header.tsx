import React from 'react';
import { Icon } from './Icon';

interface HeaderProps {
  onReset: () => void;
  showReset: boolean;
}

const Header: React.FC<HeaderProps> = ({ onReset, showReset }) => {
  return (
    <header className="text-center relative">
      <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight flex items-center justify-center">
        Smart Dry
        <span className="ml-3 px-3 py-1 bg-[#7FE5D2] text-black text-3xl font-bold rounded-lg tracking-normal">
          AI
        </span>
      </h1>
      <p className="mt-2 text-md text-gray-600">
        Create new orders on the fly.
      </p>
      {showReset && (
         <button 
            onClick={onReset} 
            className="absolute top-0 right-0 mt-2 text-gray-500 hover:text-red-600 transition-colors"
            aria-label="Cancel Order"
          >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
      )}
    </header>
  );
};

export default Header;