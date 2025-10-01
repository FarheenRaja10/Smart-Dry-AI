import React, { useState, useCallback, useEffect } from 'react';
import { analyzeGarmentImage, analyzeGarmentVideoFrames, analyzeGarmentText, analyzeGarmentByBarcode } from './services/geminiService';
import * as apiService from './services/historyService';
import { checkImageQuality } from './services/imageQualityService';
import type { GarmentDetails, InputMode, Order, Customer, ServiceType, Modifier } from './types';
import { Icon } from './components/Icon';

// Component Imports
import Header from './components/Header';
import InputSelector from './components/InputSelector';
import ImageUpload from './components/ImageUpload';
import CameraCapture from './components/CameraCapture';
import OrderSummary from './components/LabelSearch';
import ResultDisplay from './components/ResultDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import CustomerSelector from './components/BarcodeSearch';
import OrderHistory from './components/HistoryList';
import PrintView from './components/PrintView';
import VideoBatchCapture from './components/VideoBatchCapture';
import BatchReview from './components/BatchReview';
import CatalogSelector from './components/CatalogSelector';
import ModifierSelector from './components/ModifierSelector';

// In-file component for Service Selection
interface ServiceSelectorProps {
  onSelectService: (service: ServiceType) => void;
  onBack: () => void;
  customerName: string;
}

const services: { name: ServiceType; icon: string; description: string }[] = [
  { name: 'Dry Cleaning', icon: 'care', description: 'For delicate fabrics and suits.' },
  { name: 'Laundry', icon: 'itemType', description: 'Standard wash, dry, and fold.' },
  { name: 'Alteration', icon: 'scan', description: 'Resizing, hemming, or repairs.' },
  { name: 'Repair', icon: 'warning', description: 'Fixing buttons, seams, and zippers.' },
];

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ onSelectService, onBack, customerName }) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 relative">
        <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#50C1AE] transition-colors">
          <Icon name="back" />
        </button>
        <div className="text-center flex-grow">
            <h2 className="text-xl font-bold text-gray-800">Select Service</h2>
            <p className="text-sm text-gray-500">For: <span className="font-semibold">{customerName}</span></p>
        </div>
      </div>
      <div className="space-y-3">
        {services.map(service => (
          <button
            key={service.name}
            onClick={() => onSelectService(service.name)}
            className="w-full flex items-center p-4 text-left bg-white rounded-xl shadow-md hover:shadow-lg hover:bg-[#E0F8F4] transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7FE5D2] focus:ring-opacity-50"
          >
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-[#E0F8F4] text-[#50C1AE] rounded-lg">
              <Icon name={service.icon} />
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900">{service.name}</p>
              <p className="text-sm text-gray-500">{service.description}</p>
            </div>
            <div className="ml-auto text-gray-400">
                <Icon name="chevronRight" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};


type View = 
  | 'home'
  | 'customer_select'
  | 'service_select'
  | 'modifier_select'
  | 'order_summary'
  | 'add_item_method'
  | 'add_item_capture'
  | 'add_item_video_capture'
  | 'add_item_catalog'
  | 'item_review'
  | 'batch_review'
  | 'order_history'
  | 'loading'
  | 'error'
  | 'print_tags';

export default function App(): React.ReactElement {
  const [view, setView] = useState<View>('home');
  const [captureMode, setCaptureMode] = useState<InputMode | null>(null);

  // App-level state
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isQuickScanFlow, setIsQuickScanFlow] = useState<boolean>(false);
  
  // Data states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Item analysis flow states
  const [imageData, setImageData] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GarmentDetails | null>(null);
  const [batchAnalysisResult, setBatchAnalysisResult] = useState<GarmentDetails[] | null>(null);
  const [itemsToPrint, setItemsToPrint] = useState<GarmentDetails[]>([]);

  useEffect(() => {
    async function loadInitialData() {
        try {
            const [customersData, ordersData] = await Promise.all([
                apiService.fetchCustomers(),
                apiService.fetchOrders(),
            ]);
            setCustomers(customersData);
            setOrders(ordersData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to connect to the SmartDry POS.");
            setView('error');
        } finally {
            setAppLoading(false);
        }
    }
    loadInitialData();
  }, []);

  // ====== Data Handling ======

  const handleAddNewCustomer = async (name: string, phone: string, preferences: string) => {
    setIsSubmitting(true);
    try {
        const newCustomer = await apiService.createCustomer({ name, phone, preferences });
        setCustomers(prev => [...prev, newCustomer]);
        handleCustomerSelect(newCustomer);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save customer.');
        setView('error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleQuickScanStart = (customer: Customer) => {
    const now = new Date();
    // Default to 2 days from now for standard delivery
    const standardCollectionDate = new Date(new Date().setDate(now.getDate() + 2));

    const newOrder: Order = {
      id: Date.now().toString(),
      customer: customer,
      serviceType: 'Dry Cleaning', // Default service
      items: [],
      timestamp: Date.now(),
      status: 'active',
      deliveryType: 'Standard', // Default delivery
      collectionDate: standardCollectionDate.toISOString().split('T')[0],
      paymentMethod: 'Pay on Collection', // Default payment
      modifiers: [],
    };
    setActiveOrder(newOrder);
    setSelectedCustomer(null); // Clear selected customer as it's now in the order
    setIsQuickScanFlow(false); // Reset the flow flag
    setView('add_item_method'); // Go directly to adding items
  };

  const handleCustomerSelect = (customer: Customer) => {
    if (isQuickScanFlow) {
        handleQuickScanStart(customer);
    } else {
        setSelectedCustomer(customer);
        setView('service_select');
    }
  };

  const handleServiceSelect = (serviceType: ServiceType) => {
    if (selectedCustomer) {
      const now = new Date();
      // Default to 2 days from now for standard delivery
      const standardCollectionDate = new Date(now.setDate(now.getDate() + 2));

      const newOrder: Order = {
        id: Date.now().toString(),
        customer: selectedCustomer,
        serviceType,
        items: [],
        timestamp: Date.now(),
        status: 'active',
        deliveryType: 'Standard',
        collectionDate: standardCollectionDate.toISOString().split('T')[0], // YYYY-MM-DD format
        paymentMethod: 'Pay on Collection',
        modifiers: [],
      };
      setActiveOrder(newOrder);
      setSelectedCustomer(null);
      setView('modifier_select');
    }
  };

  const handleModifiersConfirm = (modifiers: Modifier[]) => {
      if(activeOrder) {
          setActiveOrder(prev => {
              if(!prev) return null;
              return { ...prev, modifiers };
          });
          setView('order_summary');
      }
  };

  const handleUpdateOrderDetails = (details: Partial<Omit<Order, 'items' | 'id' | 'customer'>>) => {
      if (activeOrder) {
          setActiveOrder(prev => {
              if (!prev) return null;
              return { ...prev, ...details };
          });
      }
  };

  const handleAddGarmentToOrder = (garment: GarmentDetails) => {
    if (activeOrder) {
      const updatedOrder = { ...activeOrder, items: [...activeOrder.items, garment] };
      setActiveOrder(updatedOrder);
    }
    setAnalysisResult(null);
    setImageData(null);
    setView('order_summary');
  };
  
  const handleAddBatchToOrder = (garments: GarmentDetails[]) => {
    if (activeOrder) {
      const updatedOrder = { ...activeOrder, items: [...activeOrder.items, ...garments] };
      setActiveOrder(updatedOrder);
    }
    setAnalysisResult(null);
    setBatchAnalysisResult(null);
    setImageData(null);
    setView('order_summary');
  };

  const handleCompleteOrder = async () => {
    if (activeOrder) {
      setIsSubmitting(true);
      try {
        const completedOrder = { ...activeOrder, status: 'completed', timestamp: Date.now() } as Order;
        const savedOrder = await apiService.createOrder(completedOrder);
        setOrders(prev => [savedOrder, ...prev]);
        setActiveOrder(null);
        setView('home');
      } catch(err) {
        setError(err instanceof Error ? err.message : 'Could not complete order.');
        setView('error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const cancelOrder = () => {
    setActiveOrder(null);
    setSelectedCustomer(null);
    setAnalysisResult(null);
    setBatchAnalysisResult(null);
    setImageData(null);
    setError(null);
    setIsQuickScanFlow(false);
    setView('home');
  };

  // ====== Analysis Flow ======

  const startAnalysis = async (analysisFn: Promise<GarmentDetails>, image?: string) => {
    setView('loading');
    setError(null);
    setAnalysisResult(null);
    if(image) setImageData(image);
    
    try {
      const result = await analysisFn;
      setAnalysisResult(result);
      setView('item_review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setView('error');
    }
  };

  const handleImageSubmit = useCallback(async (base64Image: string) => {
    const qualityCheck = await checkImageQuality(base64Image);
    if (!qualityCheck.isGood) {
      setError(qualityCheck.message);
      setView('error');
      return;
    }
    startAnalysis(analyzeGarmentImage(base64Image), base64Image);
  }, []);

  const handleVideoSubmit = useCallback(async (frames: string[]) => {
    setView('loading');
    setError(null);
    setBatchAnalysisResult(null);

    try {
        const results = await analyzeGarmentVideoFrames(frames);
        if (results.length === 0) {
            setError("No garments could be identified from the video. Please try again with better lighting and a clearer view of the items.");
            setView('error');
            return;
        }
        // Attach the correct image to each result using the frameIndex from the AI
        const resultsWithImages = results.map(result => ({
            ...result,
            image: (result.frameIndex !== undefined && frames[result.frameIndex]) ? frames[result.frameIndex] : undefined,
        }));

        setBatchAnalysisResult(resultsWithImages);
        setView('batch_review');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during video analysis.');
        setView('error');
    }
  }, []);

  const handleCatalogItemSelect = (itemType: string) => {
    const defaultGarment: GarmentDetails = {
        brand: '',
        color: '',
        material: '',
        itemType: itemType,
        careInstruction: 'Unknown',
        price: 0,
        problems: [],
    };
    setAnalysisResult(defaultGarment);
    setImageData(null); // No image for manual entry
    setView('item_review');
  };

  // ====== Printing Flow ======
  const handlePrintTag = (item: GarmentDetails) => {
    if (activeOrder) {
        setItemsToPrint([item]);
        setView('print_tags');
    }
  }

  const handlePrintAllTags = () => {
      if (activeOrder && activeOrder.items.length > 0) {
          setItemsToPrint(activeOrder.items);
          setView('print_tags');
      }
  }

  // ====== View Transitions ======

  const startQuickScanFlow = () => {
    setIsQuickScanFlow(true);
    setView('customer_select');
  };

  const goToAddItemMethod = () => setView('add_item_method');
  const handleSelectInputMode = (mode: InputMode) => {
    setCaptureMode(mode);
    if (mode === 'video') {
        setView('add_item_video_capture');
    } else if (mode === 'manual_entry') {
        setView('add_item_catalog');
    } else {
        setView('add_item_capture');
    }
  };
  
  const handleShowHistory = () => setView('order_history');
  const handleBack = () => {
    if (view === 'customer_select' || view === 'order_history') setView('home');
    else if (view === 'service_select') setView('customer_select');
    else if (view === 'modifier_select') setView('service_select');
    else if (view === 'order_summary') cancelOrder();
    else if (view === 'add_item_method') setView('order_summary');
    else if (view === 'add_item_capture' || view === 'add_item_video_capture' || view === 'add_item_catalog') setView('add_item_method');
    else if (view === 'item_review' || view === 'batch_review' || view === 'error') setView('add_item_method');
    else cancelOrder();
  };

  const handleClearHistory = async () => {
    await apiService.clearOrders();
    setOrders([]);
  }

  const renderContent = () => {
    if (appLoading) {
        return <LoadingSpinner title="Connecting to SmartDry..." message="Fetching latest customer and order data." />;
    }

    switch (view) {
      case 'loading':
        return <LoadingSpinner />;
      case 'error':
        return (
          <div className="text-center p-8 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-red-700 font-semibold">An Error Occurred</p>
            <p className="text-red-600 mt-2">{error}</p>
            <button onClick={handleBack} className="mt-6 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600">
              Back
            </button>
          </div>
        );
      case 'order_history':
        return <OrderHistory orders={orders} onClearHistory={handleClearHistory} onBack={handleBack} onSelectOrder={() => {}} />;
      
      case 'customer_select':
        return <CustomerSelector customers={customers} onCustomerSelect={handleCustomerSelect} onAddNewCustomer={handleAddNewCustomer} onBack={handleBack} isSubmitting={isSubmitting} />;

      case 'service_select':
        if (selectedCustomer) {
          return <ServiceSelector customerName={selectedCustomer.name} onSelectService={handleServiceSelect} onBack={handleBack} />;
        }
        setView('customer_select');
        return null;

      case 'modifier_select':
        if (activeOrder) {
            return <ModifierSelector order={activeOrder} onConfirm={handleModifiersConfirm} onBack={handleBack} />;
        }
        setView('service_select'); // fallback
        return null;
      
      case 'print_tags':
        if(activeOrder) {
            return <PrintView 
                order={activeOrder} 
                items={itemsToPrint} 
                onClose={() => setView('order_summary')} 
            />
        }
        setView('home'); // fallback
        return null;

      case 'order_summary':
        if (activeOrder) {
          return <OrderSummary order={activeOrder} onAddGarment={goToAddItemMethod} onCompleteOrder={handleCompleteOrder} onCancelOrder={cancelOrder} isSubmitting={isSubmitting} onPrintTag={handlePrintTag} onPrintAllTags={handlePrintAllTags} onUpdateOrderDetails={handleUpdateOrderDetails} />;
        }
        setView('home');
        return null;

      case 'add_item_method':
        return <InputSelector onSelectMode={handleSelectInputMode} />;
      
      case 'item_review':
        if (analysisResult) {
          return <ResultDisplay result={analysisResult} image={imageData} onConfirm={handleAddGarmentToOrder} onCancel={handleBack} />;
        }
        setView('order_summary');
        return null;

      case 'batch_review':
        if (batchAnalysisResult) {
          return <BatchReview results={batchAnalysisResult} onConfirm={handleAddBatchToOrder} onCancel={handleBack} />;
        }
        setView('order_summary');
        return null;
        
      case 'add_item_capture':
        switch (captureMode) {
            case 'camera': return <CameraCapture onSubmit={handleImageSubmit} onBack={handleBack} />;
            case 'barcode': return <CameraCapture onSubmit={handleImageSubmit} onBack={handleBack} isBarcode={true} />;
            default: setView('add_item_method'); return null;
        }

      case 'add_item_video_capture':
        return <VideoBatchCapture onSubmit={handleVideoSubmit} onBack={handleBack} />;

      case 'add_item_catalog':
        return <CatalogSelector onSelectItem={handleCatalogItemSelect} onBack={handleBack} />;

      case 'home':
      default:
        return (
            <div className="p-8 space-y-4">
                <button onClick={() => setView('customer_select')} className="w-full bg-[#7FE5D2] text-black font-bold py-4 px-4 rounded-lg hover:bg-[#65D1BC] transition-colors text-lg">
                    Start New Order
                </button>
                <button onClick={handleShowHistory} className="w-full bg-white text-[#50C1AE] font-bold py-3 px-4 rounded-lg border-2 border-[#7FE5D2] hover:bg-[#E0F8F4] transition-colors">
                    View Order History
                </button>
                <button onClick={startQuickScanFlow} className="w-full bg-[#50C1AE] text-white font-bold py-4 px-4 rounded-lg hover:bg-[#40A892] transition-colors text-lg flex items-center justify-center">
                    <Icon name="scan" />
                    <span className="ml-2">Quick Scan</span>
                </button>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-100 flex items-center justify-center p-2 sm:p-4 font-sans">
      <div className="w-full max-w-lg">
        <div className="text-gray-800">
          <Header onReset={cancelOrder} showReset={!!activeOrder || !!selectedCustomer} />
          <main className="mt-6 bg-white rounded-2xl shadow-lg overflow-hidden relative">
              {renderContent()}
          </main>
          <footer className="text-center mt-8 text-gray-500 text-sm">
              <p>Powered by Serveo</p>
          </footer>
        </div>
      </div>
    </div>
  );
}