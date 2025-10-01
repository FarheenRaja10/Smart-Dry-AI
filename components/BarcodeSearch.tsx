import React, { useState, useMemo } from 'react';
import { Icon } from './Icon';
import type { Customer } from '../types';

interface CustomerSelectorProps {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
  onAddNewCustomer: (name: string, phone: string, preferences: string) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ customers, onCustomerSelect, onAddNewCustomer, onBack, isSubmitting }) => {
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferences, setPreferences] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNewCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim() && !isSubmitting) {
      await onAddNewCustomer(name.trim(), phone.trim(), preferences.trim());
      setName('');
      setPhone('');
      setPreferences('');
      setShowNewCustomerForm(false);
    }
  };

  const filteredCustomers = useMemo(() => 
    customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    ), [customers, searchQuery]);

  return (
    <div className="p-6">
       <button onClick={onBack} className="absolute top-4 left-4 text-gray-500 hover:text-[#50C1AE] transition-colors">
            <Icon name="back" />
        </button>
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Select Customer</h2>
      
      {showNewCustomerForm ? (
        <form onSubmit={handleNewCustomerSubmit} className="mb-4 p-4 border rounded-lg bg-gray-50">
          <fieldset disabled={isSubmitting}>
            <h3 className="font-semibold mb-2">New Customer</h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              required
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              required
            />
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Preferences & Notes (e.g., allergies, starch preference)"
              className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg resize-y disabled:bg-gray-100"
              rows={2}
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[#7FE5D2] text-black font-bold py-2 px-3 rounded-lg hover:bg-[#65D1BC] disabled:bg-gray-400 flex items-center justify-center">
                {isSubmitting && <div className="animate-spin mr-2"><Icon name="loader" size={18}/></div>}
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowNewCustomerForm(false)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </fieldset>
        </form>
      ) : (
        <button onClick={() => setShowNewCustomerForm(true)} className="w-full mb-4 bg-white border border-[#7FE5D2] text-[#7FE5D2] font-bold py-2 px-4 rounded-lg hover:bg-[#E0F8F4] transition-colors">
          Add New Customer
        </button>
      )}

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7FE5D2]"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon name="search" />
        </div>
      </div>
      
      <div className="max-h-60 overflow-y-auto space-y-2">
        {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
          <button 
            key={customer.id} 
            onClick={() => onCustomerSelect(customer)}
            className="w-full text-left p-3 bg-white rounded-lg shadow-sm hover:bg-[#E0F8F4] border"
          >
            <p className="font-semibold">{customer.name}</p>
            <p className="text-sm text-gray-500">{customer.phone}</p>
          </button>
        )) : (
          <p className="text-center text-gray-500 py-4">No customers found.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerSelector;