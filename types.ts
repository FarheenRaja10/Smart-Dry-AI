export type InputMode = 'camera' | 'barcode' | 'video' | 'manual_entry';

export type ServiceType = 'Dry Cleaning' | 'Laundry' | 'Alteration' | 'Repair';
export type DeliveryType = 'Standard' | 'Express';
export type PaymentMethod = 'Pay on Collection' | 'Pay Now';


export interface GarmentDetails {
  brand?: string;
  color: string;
  material: string;
  itemType: string;
  careInstruction: 'Laundry' | 'Dry Clean' | 'Unknown';
  problems?: string[];
  price?: number;
  notes?: string;
  image?: string;
  frameIndex?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  preferences?: string;
}

export interface Modifier {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export interface Order {
  id:string;
  customer: Customer;
  serviceType: ServiceType;
  items: GarmentDetails[];
  timestamp: number;
  status: 'active' | 'completed';
  deliveryType: DeliveryType;
  collectionDate: string; // ISO date string YYYY-MM-DD
  paymentMethod: PaymentMethod;
  modifiers?: Modifier[];
}