import React, { useState, useMemo } from 'react';
import { Icon } from './Icon';

interface CatalogSelectorProps {
  onSelectItem: (itemType: string) => void;
  onBack: () => void;
}

const catalog: Record<string, string[]> = {
  "Tops": ["T-Shirt", "Blouse", "Shirt", "Sweater", "Polo Shirt", "Tank Top"],
  "Bottoms": ["Pants", "Jeans", "Skirt", "Shorts", "Trousers"],
  "Outerwear": ["Jacket", "Coat", "Blazer", "Vest", "Hoodie"],
  "Full Body": ["Dress", "Jumpsuit", "Suit (2-piece)", "Tuxedo"],
  "Household": ["Bed Sheets (Set)", "Comforter", "Duvet Cover", "Curtains (Panel)", "Tablecloth"],
  "Accessories": ["Scarf", "Tie", "Hat", "Gloves (Pair)"],
};

const CatalogSelector: React.FC<CatalogSelectorProps> = ({ onSelectItem, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCatalog = useMemo(() => {
        if (!searchQuery) {
            return catalog;
        }

        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered: Record<string, string[]> = {};

        for (const category in catalog) {
            const matchingItems = catalog[category].filter(item =>
                item.toLowerCase().includes(lowercasedQuery)
            );
            if (matchingItems.length > 0) {
                filtered[category] = matchingItems;
            }
        }
        return filtered;
    }, [searchQuery]);

    return (
        <div className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 relative">
                <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#50C1AE] transition-colors">
                <Icon name="back" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 text-center flex-grow">Add Manually</h2>
            </div>

            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search for an item..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7FE5D2]"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon name="search" />
                </div>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-1">
                {Object.keys(filteredCatalog).length > 0 ? (
                    // FIX: Replaced `Object.entries` with `Object.keys` for better compatibility.
                    // This resolves the error "Property 'map' does not exist on type 'unknown'".
                    Object.keys(filteredCatalog).map((category) => (
                        <div key={category}>
                            <h3 className="font-semibold text-gray-600 mb-2 pl-1">{category}</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {filteredCatalog[category].map(item => (
                                    <button
                                        key={item}
                                        onClick={() => onSelectItem(item)}
                                        className="w-full text-center p-3 bg-white rounded-lg shadow-sm hover:bg-[#E0F8F4] border text-sm font-medium"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">No items found.</p>
                )}
            </div>
        </div>
    );
};

export default CatalogSelector;
