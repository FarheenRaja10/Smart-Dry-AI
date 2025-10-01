import React from 'react';
import type { Order, GarmentDetails } from '../types';
import { Icon } from './Icon';

interface PrintViewProps {
  order: Order;
  items: GarmentDetails[];
  onClose: () => void;
}

const PrintView: React.FC<PrintViewProps> = ({ order, items, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  // A simple formatter to avoid timezone issues and show a clean date.
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString();
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .garment-tag {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="p-4 relative">
        {/* Header with non-printable buttons */}
        <div className="print:hidden mb-6 flex justify-between items-center">
            <button onClick={onClose} className="flex items-center text-gray-500 hover:text-[#50C1AE] transition-colors">
                <Icon name="back" />
                <span className="ml-2 font-semibold">Back to Order</span>
            </button>
          <h2 className="text-xl font-bold text-gray-800">Print Preview</h2>
          <button onClick={handlePrint} className="bg-[#7FE5D2] text-black font-bold py-2 px-4 rounded-lg hover:bg-[#65D1BC] transition-colors flex items-center">
            <Icon name="print" />
            <span className="ml-2">Print</span>
          </button>
        </div>

        {/* Printable Content */}
        <div className="printable-area">
          <div className="grid grid-cols-2 gap-4">
            {items.map((item, index) => (
              <div key={index} className="garment-tag border-2 border-dashed border-gray-400 rounded-lg p-4 flex flex-col space-y-2 bg-white">
                <div className="flex justify-between items-start border-b pb-2 mb-2">
                    <div>
                        <p className="font-bold text-lg">{order.customer.name}</p>
                        <p className="text-sm text-gray-600">Order ID: {order.id.slice(-6)}</p>
                        <p className="text-sm text-gray-600 font-semibold">Collect By: {formatDate(order.collectionDate)}</p>
                    </div>
                     {item.image ? (
                        <img src={item.image} alt={item.itemType} className="w-16 h-16 object-cover rounded-md border" />
                    ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-md">
                            <Icon name="itemType" className="text-gray-400" />
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-xs text-gray-500">Item</p>
                    <p className="font-semibold">{item.brand && item.brand.toLowerCase() !== 'n/a' && item.brand.toLowerCase() !== 'unbranded' ? `${item.brand} ` : ''}{item.itemType}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4">
                    <div>
                        <p className="text-xs text-gray-500">Color</p>
                        <p className="font-semibold">{item.color}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Material</p>
                        <p className="font-semibold">{item.material}</p>
                    </div>
                </div>

                <div>
                    <p className="text-xs text-gray-500">Care</p>
                    <p className="font-semibold bg-[#E0F8F4] text-[#40A892] rounded-full px-3 py-1 inline-block text-sm">{item.careInstruction}</p>
                </div>

                {item.problems && item.problems.length > 0 && (
                    <div className="pt-2">
                        <p className="text-xs text-red-600 font-bold">ISSUES:</p>
                        <ul className="list-disc list-inside">
                            {item.problems.map((p, i) => <li key={i} className="text-sm text-red-700">{p}</li>)}
                        </ul>
                    </div>
                )}
                
                {item.notes && (
                    <div className="pt-2">
                        <p className="text-xs text-blue-600 font-bold">NOTES:</p>
                        <p className="text-sm italic">{item.notes}</p>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintView;
