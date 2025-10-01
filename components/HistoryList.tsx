import React from 'react';
import type { Order } from '../types';
import { Icon } from './Icon';

interface OrderHistoryProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onClearHistory: () => void;
  onBack: () => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onSelectOrder, onClearHistory, onBack }) => {
  const calculateTotal = (order: Order) => {
    return order.items.reduce((acc, item) => acc + (item.price || 0), 0).toFixed(2);
  }
  
  // A simple formatter to avoid timezone issues and show a clean date.
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString();
  }


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 relative">
        <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#50C1AE] transition-colors">
          <Icon name="back" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 text-center flex-grow">Order History</h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="history" className="mx-auto text-gray-400" size={48} />
          <p className="mt-4 text-gray-600 animate-pulse">No orders yet.</p>
          <p className="text-sm text-gray-500">Completed orders will appear here.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {orders.map(order => (
              <li key={order.id}>
                <button 
                  onClick={() => onSelectOrder(order)} 
                  className="w-full flex items-center p-3 text-left bg-white rounded-xl shadow-md hover:shadow-lg hover:bg-[#E0F8F4] transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7FE5D2] focus:ring-opacity-50"
                  aria-label={`View details for order from ${order.customer.name}`}
                >
                   <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-[#E0F8F4] text-[#50C1AE] rounded-md">
                       <Icon name="itemType" />
                    </div>
                   <div className="ml-4 flex-grow min-w-0">
                        <p className="text-md font-semibold text-gray-900 truncate">
                            {order.customer.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{new Date(order.timestamp).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Due: {formatDate(order.collectionDate)}</p>
                   </div>
                   <div className="ml-2 text-right flex flex-col items-end space-y-1">
                        <p className="text-md font-bold text-[#50C1AE]">${calculateTotal(order)}</p>
                        <p className="text-xs text-gray-500">{order.items.length} items</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.deliveryType === 'Express' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{order.deliveryType}</span>
                   </div>
                </button>
              </li>
            ))}
          </ul>
          <button 
            onClick={onClearHistory}
            className="w-full mt-6 text-sm text-center text-red-500 hover:text-red-700 font-semibold"
          >
            Clear History
          </button>
        </>
      )}
    </div>
  );
};

export default OrderHistory;
