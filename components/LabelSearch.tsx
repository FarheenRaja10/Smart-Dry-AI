import React from 'react';
import { Icon } from './Icon';
import type { Order, GarmentDetails, DeliveryType, PaymentMethod } from '../types';

interface OrderSummaryProps {
  order: Order;
  onAddGarment: () => void;
  onCompleteOrder: () => void;
  onCancelOrder: () => void;
  isSubmitting: boolean;
  onPrintTag: (item: GarmentDetails) => void;
  onPrintAllTags: () => void;
  onUpdateOrderDetails: (details: Partial<Omit<Order, 'items' | 'id' | 'customer'>>) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ order, onAddGarment, onCompleteOrder, isSubmitting, onPrintTag, onPrintAllTags, onUpdateOrderDetails }) => {
  const itemsTotal = order.items.reduce((sum, item) => sum + (item.price || 0), 0);
  const modifiersTotal = order.modifiers?.reduce((sum, mod) => sum + (mod.price || 0), 0) || 0;
  const total = itemsTotal + modifiersTotal;

  const handleConfirmCompletion = () => {
    if (window.confirm('Are you sure you want to complete this order?')) {
      onCompleteOrder();
    }
  };
  
  const handleDeliveryTypeChange = (type: DeliveryType) => {
    const newCollectionDate = new Date();
    // Set hours to 0 to avoid timezone issues with date input
    newCollectionDate.setHours(0, 0, 0, 0);

    if (type === 'Express') {
        newCollectionDate.setDate(newCollectionDate.getDate() + 1);
    } else {
        newCollectionDate.setDate(newCollectionDate.getDate() + 2);
    }
    
    onUpdateOrderDetails({
        deliveryType: type,
        collectionDate: newCollectionDate.toISOString().split('T')[0],
    });
  };

  const DetailSection: React.FC<{iconName: string, title: string, children: React.ReactNode}> = ({iconName, title, children}) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 h-8 w-8 mt-1 flex items-center justify-center bg-[#E0F8F4] text-[#50C1AE] rounded-full">
            <Icon name={iconName} size={20} />
        </div>
        <div className="ml-3 flex-grow">
            <p className="text-sm font-semibold text-gray-700">{title}</p>
            <div className="mt-1">
                {children}
            </div>
        </div>
    </div>
  );

  const GarmentItem: React.FC<{ item: GarmentDetails }> = ({ item }) => (
    <div className="flex items-center p-3 bg-white rounded-lg border">
      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md">
        {item.image ? (
            <img src={item.image} alt={item.itemType} className="h-full w-full object-cover rounded-md" />
        ) : (
            <Icon name="itemType" />
        )}
      </div>
      <div className="ml-3 flex-grow min-w-0">
        <p className="font-semibold truncate">{item.brand && item.brand.toLowerCase() !== 'n/a' && item.brand.toLowerCase() !== 'unbranded' ? `${item.brand} ` : ''}{item.itemType}</p>
        <p className="text-sm text-gray-500">{item.color} {item.material}</p>
        {item.notes && <p className="text-xs text-blue-600 bg-blue-50 rounded mt-1 p-1 italic truncate">Note: {item.notes}</p>}
      </div>
      <div className="ml-3 text-right flex-shrink-0">
        <p className="font-semibold text-gray-800">${(item.price || 0).toFixed(2)}</p>
        <button onClick={() => onPrintTag(item)} className="text-[#50C1AE] hover:text-[#40A892] transition-colors" aria-label={`Print tag for ${item.itemType}`}>
            <Icon name="print" size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
        <p className="text-gray-600">For: <span className="font-semibold">{order.customer.name}</span></p>
        <p className="text-sm text-[#40A892] bg-[#E0F8F4] font-medium rounded-full px-3 py-1 inline-block mt-2">{order.serviceType}</p>
      </div>
      
      {/* Order Details Section */}
      <div className="mb-4 p-4 rounded-lg bg-gray-50 border space-y-4">
        <DetailSection iconName="truck" title="Delivery Type">
            <div className="flex gap-2">
                {(['Standard', 'Express'] as DeliveryType[]).map(type => (
                    <button
                        key={type}
                        onClick={() => handleDeliveryTypeChange(type)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors w-full ${
                            order.deliveryType === type
                                ? 'bg-[#50C1AE] text-white shadow'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </DetailSection>
        <DetailSection iconName="calendar" title="Collection Date">
             <input 
                type="date"
                value={order.collectionDate}
                onChange={e => onUpdateOrderDetails({ collectionDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7FE5D2]"
            />
        </DetailSection>
        <DetailSection iconName="creditCard" title="Payment Method">
            <div className="flex gap-2">
                 {(['Pay on Collection', 'Pay Now'] as PaymentMethod[]).map(method => (
                    <button
                        key={method}
                        onClick={() => onUpdateOrderDetails({ paymentMethod: method })}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors w-full ${
                            order.paymentMethod === method
                                ? 'bg-[#50C1AE] text-white shadow'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {method}
                    </button>
                ))}
            </div>
        </DetailSection>
        {order.modifiers && order.modifiers.length > 0 && (
            <DetailSection iconName="sparkles" title="Add-ons">
                <ul className="space-y-1 text-sm">
                    {order.modifiers.map(mod => (
                        <li key={mod.id} className="flex justify-between items-center">
                            <span className="text-gray-600">{mod.name}</span>
                            <span className="font-semibold text-gray-800">+${mod.price.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </DetailSection>
        )}
      </div>

      <div className="mb-4 p-3 rounded-lg bg-[#E0F8F4] border border-[#B2F0E5]">
        <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Total</span>
            <span className="text-2xl font-bold text-[#50C1AE]">${total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
        {order.items.length > 0 ? (
          order.items.map((item, index) => <GarmentItem key={index} item={item} />)
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No garments added yet.</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={onAddGarment}
          className="w-full bg-white text-[#50C1AE] font-bold py-3 px-4 rounded-lg border-2 border-[#7FE5D2] hover:bg-[#E0F8F4] transition-colors flex items-center justify-center"
        >
          <Icon name="scan" />
          <span className="ml-2">Add Garment</span>
        </button>
        {order.items.length > 0 && (
          <button
            onClick={onPrintAllTags}
            className="w-full bg-white text-gray-700 font-bold py-3 px-4 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <Icon name="print" />
            <span className="ml-2">Print All Tags</span>
          </button>
        )}
        <button
          onClick={handleConfirmCompletion}
          disabled={order.items.length === 0 || isSubmitting}
          className="w-full bg-[#7FE5D2] text-black font-bold py-3 px-4 rounded-lg hover:bg-[#65D1BC] transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
                <div className="animate-spin"><Icon name="loader" /></div>
                <span className="ml-2">Submitting...</span>
            </>
          ) : (
            <>
                <Icon name="care" />
                <span className="ml-2">Complete Order</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;