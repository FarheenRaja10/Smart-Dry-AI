import React, { useState } from 'react';
import type { Modifier, Order } from '../types';
import { Icon } from './Icon';

const availableModifiers: Modifier[] = [
  { id: 'mod_deodorize', name: 'Deodorize', description: 'Eliminate tough odors with a deep fresh scent.', price: 2.50, icon: 'sparkles' },
  { id: 'mod_stain_protect', name: 'Stain Protection', description: 'Apply a protective layer to repel future stains.', price: 5.00, icon: 'shieldCheck' },
  { id: 'mod_gift_wrap', name: 'Gift Wrapping', description: 'Professionally wrapped for any special occasion.', price: 3.00, icon: 'gift' },
];

interface ModifierSelectorProps {
  order: Order;
  onConfirm: (modifiers: Modifier[]) => void;
  onBack: () => void;
}

const ModifierSelector: React.FC<ModifierSelectorProps> = ({ order, onConfirm, onBack }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleModifier = (modifierId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modifierId)) {
        newSet.delete(modifierId);
      } else {
        newSet.add(modifierId);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    const selectedModifiers = availableModifiers.filter(mod => selectedIds.has(mod.id));
    onConfirm(selectedModifiers);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 relative">
        <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#50C1AE] transition-colors">
          <Icon name="back" />
        </button>
        <div className="text-center flex-grow">
          <h2 className="text-xl font-bold text-gray-800">Add-ons & Extras</h2>
          <p className="text-sm text-gray-500">For: <span className="font-semibold">{order.customer.name}</span></p>
        </div>
      </div>
      <div className="space-y-3">
        {availableModifiers.map(modifier => {
          const isSelected = selectedIds.has(modifier.id);
          return (
            <button
              key={modifier.id}
              onClick={() => toggleModifier(modifier.id)}
              className={`w-full flex items-center p-4 text-left rounded-xl shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7FE5D2] focus:ring-opacity-50 ${isSelected ? 'bg-teal-50 border border-teal-400 shadow-lg' : 'bg-white hover:shadow-lg hover:bg-[#E0F8F4]'}`}
            >
              <div className={`flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg ${isSelected ? 'bg-[#50C1AE] text-white' : 'bg-[#E0F8F4] text-[#50C1AE]'}`}>
                <Icon name={modifier.icon} />
              </div>
              <div className="ml-4 flex-grow">
                <p className="text-lg font-semibold text-gray-900">{modifier.name}</p>
                <p className="text-sm text-gray-500">{modifier.description}</p>
              </div>
              <div className="ml-3 text-right">
                <p className="font-semibold text-gray-800">+${modifier.price.toFixed(2)}</p>
                <div className="mt-1 text-[#50C1AE]">
                    <Icon name={isSelected ? 'checkboxChecked' : 'checkbox'} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
       <button 
        onClick={handleConfirm} 
        className="w-full mt-8 bg-[#7FE5D2] text-black font-bold py-3 px-4 rounded-lg hover:bg-[#65D1BC] transition-colors flex items-center justify-center"
      >
        <Icon name="chevronRight" />
        <span className="ml-2">Continue to Order Summary</span>
      </button>
    </div>
  );
};

export default ModifierSelector;
