import React, { useState, useEffect } from 'react';
import type { GarmentDetails } from '../types';
import { Icon } from './Icon';

interface BatchReviewProps {
  results: GarmentDetails[];
  onConfirm: (details: GarmentDetails[]) => void;
  onCancel: () => void;
}

interface EditableGarment extends GarmentDetails {
    id: number;
}

const EditableGarmentCard: React.FC<{
    item: EditableGarment;
    onUpdate: (id: number, field: keyof GarmentDetails, value: any) => void;
    onRemove: (id: number) => void;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
}> = ({ item, onUpdate, onRemove, isSelected, onToggleSelect }) => {
    
    return (
        <div 
            onClick={() => onToggleSelect(item.id)}
            className={`cursor-pointer bg-white rounded-xl shadow-md p-4 border transition-all duration-200 relative ${isSelected ? 'bg-teal-50 border-teal-400 shadow-lg ring-2 ring-teal-300' : 'border-gray-200'}`}
        >
             <button 
                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }} 
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1 bg-gray-100/50 hover:bg-red-100 rounded-full z-20" aria-label="Remove item"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div 
                className="absolute top-2 left-2 z-20 text-teal-600"
                aria-hidden="true"
             >
                <Icon name={isSelected ? 'checkboxChecked' : 'checkbox'} size={20} />
            </div>
            
            <div className="flex gap-4" onClick={e => e.stopPropagation()}>
                {item.image && <img src={item.image} alt={item.itemType} className="w-24 h-24 object-cover rounded-lg" />}
                <div className="flex-grow space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-500">Item Type</label>
                            <input type="text" value={item.itemType} onChange={e => onUpdate(item.id, 'itemType', e.target.value)} className="w-full bg-gray-50 p-1 rounded border"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Brand</label>
                            <input type="text" value={item.brand} onChange={e => onUpdate(item.id, 'brand', e.target.value)} className="w-full bg-gray-50 p-1 rounded border"/>
                        </div>
                         <div>
                            <label className="text-xs text-gray-500">Color</label>
                            <input type="text" value={item.color} onChange={e => onUpdate(item.id, 'color', e.target.value)} className="w-full bg-gray-50 p-1 rounded border"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Material</label>
                            <input type="text" value={item.material} onChange={e => onUpdate(item.id, 'material', e.target.value)} className="w-full bg-gray-50 p-1 rounded border"/>
                        </div>
                         <div>
                            <label className="text-xs text-gray-500">Price ($)</label>
                            <input type="number" value={item.price} onChange={e => onUpdate(item.id, 'price', parseFloat(e.target.value) || 0)} className="w-full bg-gray-50 p-1 rounded border"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Care</label>
                            <select value={item.careInstruction} onChange={e => onUpdate(item.id, 'careInstruction', e.target.value)} className="w-full bg-gray-50 p-1 rounded border">
                                <option value="Dry Clean">Dry Clean</option>
                                <option value="Laundry">Laundry</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            {item.problems && item.problems.length > 0 && (
                 <div className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded-md" onClick={e => e.stopPropagation()}>
                    <strong>Issues:</strong> {item.problems.join(', ')}
                </div>
            )}
        </div>
    )
}

const BatchReview: React.FC<BatchReviewProps> = ({ results, onConfirm, onCancel }) => {
  const [items, setItems] = useState<EditableGarment[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());

  // Bulk edit form state
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkCare, setBulkCare] = useState<'Dry Clean' | 'Laundry' | 'Unknown' | ''>('');
  
  useEffect(() => {
    setItems(results.map((item, index) => ({ ...item, id: index })));
    setSelectedItemIds(new Set());
  }, [results]);

  const handleUpdate = (id: number, field: keyof GarmentDetails, value: any) => {
      setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  
  const handleRemove = (id: number) => {
      setItems(prev => prev.filter(item => item.id !== id));
      setSelectedItemIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
      });
  };

  const handleConfirm = () => {
    // Strip the temporary 'id' field before confirming
    const finalItems = items.map(({ id, ...rest }) => rest);
    onConfirm(finalItems);
  };
  
  const handleToggleSelect = (id: number) => {
    setSelectedItemIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedItemIds(new Set(items.map(item => item.id)));
  };

  const handleDeselectAll = () => {
    setSelectedItemIds(new Set());
  };
  
  const handleApplyBulkEdit = () => {
    if (selectedItemIds.size === 0) return;

    setItems(prevItems => prevItems.map(item => {
        if (selectedItemIds.has(item.id)) {
            const updatedItem = { ...item };
            if (bulkPrice.trim() !== '') {
                const newPrice = parseFloat(bulkPrice);
                if (!isNaN(newPrice)) {
                    updatedItem.price = newPrice;
                }
            }
            if (bulkCare) {
                updatedItem.careInstruction = bulkCare as 'Dry Clean' | 'Laundry' | 'Unknown';
            }
            return updatedItem;
        }
        return item;
    }));
    
    // Reset form and selection
    setBulkPrice('');
    setBulkCare('');
    handleDeselectAll();
  };

  const isAllSelected = items.length > 0 && selectedItemIds.size === items.length;


  return (
    <div className="p-4 flex flex-col">
      <div className="flex-shrink-0">
        <button onClick={onCancel} className="absolute top-4 left-4 text-gray-500 hover:text-[#50C1AE] transition-colors">
            <Icon name="back" />
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Review Batch</h2>
      </div>
      
      {/* --- Selection & Bulk Edit Controls --- */}
      <div className="mb-4 flex-shrink-0">
          <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
            <p className="text-sm font-semibold text-gray-700">{selectedItemIds.size} selected</p>
            <button 
                onClick={isAllSelected ? handleDeselectAll : handleSelectAll}
                className="text-sm font-bold text-[#50C1AE] hover:text-[#40A892]"
            >
                {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          {selectedItemIds.size > 0 && (
            <div className="mt-3 p-3 border-2 border-dashed border-teal-300 rounded-lg bg-teal-50/50">
                <h3 className="font-semibold text-gray-800 mb-2">Bulk Edit {selectedItemIds.size} Item(s)</h3>
                <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="text-xs text-gray-600 font-medium">Set Price ($)</label>
                        <input type="number" value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} placeholder="e.g. 9.50" className="w-full bg-white p-1.5 rounded border"/>
                    </div>
                     <div>
                        <label className="text-xs text-gray-600 font-medium">Set Care</label>
                        <select value={bulkCare} onChange={e => setBulkCare(e.target.value as any)} className="w-full bg-white p-1.5 rounded border">
                            <option value="">--</option>
                            <option value="Dry Clean">Dry Clean</option>
                            <option value="Laundry">Laundry</option>
                            <option value="Unknown">Unknown</option>
                        </select>
                    </div>
                </div>
                 <button 
                    onClick={handleApplyBulkEdit}
                    className="w-full mt-3 bg-[#50C1AE] text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-[#40A892] transition-colors"
                >
                    Apply Changes
                </button>
            </div>
          )}
      </div>

      <div className="space-y-4 flex-grow overflow-y-auto pr-2">
        {items.length > 0 ? items.map((item) => (
            <EditableGarmentCard 
                key={item.id} 
                item={item} 
                onUpdate={handleUpdate} 
                onRemove={handleRemove} 
                isSelected={selectedItemIds.has(item.id)}
                onToggleSelect={handleToggleSelect}
            />
        )) : (
            <div className="text-center py-10 text-gray-500">
                <p>No items to review.</p>
                <p className="text-sm">Maybe try scanning again?</p>
            </div>
        )}
      </div>
      
      <div className="mt-4 p-4 bg-white border-t">
        <button 
            onClick={handleConfirm} 
            disabled={items.length === 0}
            className="w-full bg-[#7FE5D2] text-black font-bold py-3 px-4 rounded-lg hover:bg-[#65D1BC] transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            <Icon name="sparkles" />
            <span className="ml-2">Add {items.length} {items.length === 1 ? 'Item' : 'Items'} to Order</span>
        </button>
      </div>
    </div>
  );
};

export default BatchReview;
