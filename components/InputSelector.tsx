import React from 'react';
import type { InputMode } from '../types';
import { Icon } from './Icon';

interface InputSelectorProps {
  onSelectMode: (mode: InputMode) => void;
}

const InputOption: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center p-4 text-left bg-white rounded-xl shadow-md hover:shadow-lg hover:bg-[#E0F8F4] transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7FE5D2] focus:ring-opacity-50"
  >
    <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-[#E0F8F4] text-[#50C1AE] rounded-lg">
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-lg font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <div className="ml-auto text-gray-400">
        <Icon name="chevronRight" />
    </div>
  </button>
);


const InputSelector: React.FC<InputSelectorProps> = ({ onSelectMode }) => {
    const options = [
        { mode: 'camera', icon: 'camera', title: 'Take Photo', description: 'Scan one item with AI' },
        { mode: 'video', icon: 'video', title: 'Batch Video Scan', description: 'Scan multiple items at once' },
        { mode: 'barcode', icon: 'barcode', title: 'Scan Barcode', description: 'Read a product barcode' },
        { mode: 'manual_entry', icon: 'clipboardList', title: 'Add Manually', description: 'Select item from a list' },
    ] as const;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-center text-gray-800 mb-6">How would you like to add a garment?</h2>
      <div className="space-y-3">
        {options.map(({ mode, icon, title, description }) => (
            <InputOption
                key={mode}
                icon={<Icon name={icon} />}
                title={title}
                description={description}
                onClick={() => onSelectMode(mode)}
            />
        ))}
      </div>
    </div>
  );
};

export default InputSelector;
