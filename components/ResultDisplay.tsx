import React, { useState, useEffect } from 'react';
import type { GarmentDetails } from '../types';
import { Icon } from './Icon';

interface ResultDisplayProps {
  result: GarmentDetails;
  image: string | null;
  onConfirm: (details: GarmentDetails) => void;
  onCancel: () => void;
}

const EditableDetailRow: React.FC<{ iconName: string; label: string; value: string; onChange: (value: string) => void; }> = ({ iconName, label, value, onChange }) => (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-[#E0F8F4] text-[#50C1AE] rounded-full">
            <Icon name={iconName} />
        </div>
        <div className="ml-4 flex-grow">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <input 
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="text-md font-semibold text-gray-900 bg-transparent w-full focus:outline-none border-b-2 border-gray-200 focus:border-[#7FE5D2] transition-colors"
            />
        </div>
    </div>
);

const SelectDetailRow: React.FC<{ 
    iconName: string; 
    label: string; 
    value: 'Laundry' | 'Dry Clean' | 'Unknown'; 
    onChange: (value: 'Laundry' | 'Dry Clean' | 'Unknown') => void; 
}> = ({ iconName, label, value, onChange }) => {
    const options = [
        { value: 'Dry Clean', label: 'Dry Clean' },
        { value: 'Laundry', label: 'Laundry' },
        { value: 'Unknown', label: 'Unknown' },
    ];

    return (
        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-[#E0F8F4] text-[#50C1AE] rounded-full">
                <Icon name={iconName} />
            </div>
            <div className="ml-4 flex-grow relative">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value as 'Laundry' | 'Dry Clean' | 'Unknown')}
                    className="text-md font-semibold text-gray-900 bg-transparent w-full focus:outline-none appearance-none pr-8 border-b-2 border-gray-200 focus:border-[#7FE5D2] transition-colors"
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-500 mt-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    );
};

const PriceInputRow: React.FC<{ value: string; onChange: (value: string) => void; }> = ({ value, onChange }) => (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-[#E0F8F4] text-[#50C1AE] rounded-full">
            <Icon name="hashtag" />
        </div>
        <div className="ml-4 flex-grow">
            <p className="text-sm font-medium text-gray-500">Price</p>
            <div className="flex items-center">
                <span className="text-md font-semibold text-gray-900 mr-1">$</span>
                <input 
                    type="text"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="text-md font-semibold text-gray-900 bg-transparent w-full focus:outline-none border-b-2 border-gray-200 focus:border-[#7FE5D2] transition-colors"
                />
            </div>
        </div>
    </div>
);

const ProblemRow: React.FC<{ iconName: string; label: string; values: string[]; }> = ({ iconName, label, values }) => (
    <div className="flex items-start p-3 bg-red-50 rounded-lg border border-red-200">
        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full mt-1">
            <Icon name={iconName} />
        </div>
        <div className="ml-4 flex-grow">
            <p className="text-sm font-medium text-red-700">{label}</p>
            <ul className="list-disc list-inside mt-1">
                {values.map((value, index) => (
                    <li key={index} className="text-md font-semibold text-gray-900">{value}</li>
                ))}
            </ul>
        </div>
    </div>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, image, onConfirm, onCancel }) => {
  const [editedResult, setEditedResult] = useState<GarmentDetails>(result);
  const [notes, setNotes] = useState('');
  const [priceString, setPriceString] = useState<string>((result.price || 0).toFixed(2));

  useEffect(() => {
    setEditedResult(result);
    setNotes('');
    setPriceString((result.price || 0).toFixed(2));
  }, [result]);
  
  const handleDetailChange = (field: keyof GarmentDetails, value: string | number) => {
    setEditedResult(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePriceChange = (newPriceString: string) => {
    const priceRegex = /^\d*\.?\d{0,2}$/;
    if (priceRegex.test(newPriceString)) {
        setPriceString(newPriceString);
    }
  };

  const handleCareInstructionChange = (newCareInstruction: 'Laundry' | 'Dry Clean' | 'Unknown') => {
    setEditedResult(prev => ({ ...prev, careInstruction: newCareInstruction }));
  };

  const handleConfirm = () => {
    const finalPrice = parseFloat(priceString) || 0;
    onConfirm({ ...editedResult, price: finalPrice, notes, image: image || undefined });
  };

  return (
    <div className="p-6">
      <button onClick={onCancel} className="absolute top-4 left-4 text-gray-500 hover:text-[#50C1AE] transition-colors">
          <Icon name="back" />
      </button>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Confirm Garment</h2>
      
      {image && (
        <div className="mb-6 rounded-lg overflow-hidden shadow-md">
          <img src={image} alt="Analyzed garment" className="w-full h-auto object-cover max-h-64" />
        </div>
      )}
      
      {result.problems && result.problems.length > 0 && (
        <div className="mb-4">
            <ProblemRow iconName="warning" label="Detected Issues" values={editedResult.problems || []} />
        </div>
      )}
      
      <div className="space-y-3">
        <EditableDetailRow iconName="tag" label="Brand" value={editedResult.brand || ''} onChange={(v) => handleDetailChange('brand', v)} />
        <EditableDetailRow iconName="itemType" label="Item Type" value={editedResult.itemType} onChange={(v) => handleDetailChange('itemType', v)} />
        <EditableDetailRow iconName="color" label="Color" value={editedResult.color} onChange={(v) => handleDetailChange('color', v)} />
        <EditableDetailRow iconName="material" label="Material" value={editedResult.material} onChange={(v) => handleDetailChange('material', v)} />
        <SelectDetailRow iconName="care" label="Care Instructions" value={editedResult.careInstruction} onChange={handleCareInstructionChange} />
        <PriceInputRow value={priceString} onChange={handlePriceChange} />
      </div>

      <div className="mt-4">
          <label htmlFor="garment-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes & Special Instructions
          </label>
          <textarea
              id="garment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g., 'Heavy starch on collar', 'Repair torn cuff'"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7FE5D2]"
          />
      </div>
      
      <button 
        onClick={handleConfirm} 
        className="w-full mt-8 bg-[#7FE5D2] text-black font-bold py-3 px-4 rounded-lg hover:bg-[#65D1BC] transition-colors flex items-center justify-center"
      >
        <Icon name="sparkles" />
        <span className="ml-2">Confirm and Add to Order</span>
      </button>
    </div>
  );
};

export default ResultDisplay;