import type { Order, Customer } from '../types';

const API_LATENCY = 700; // ms

// --- In-Memory Mock Database ---
let mockCustomers: Customer[] = [
    { id: 'cust_1', name: 'Alice Johnson', phone: '555-0101', preferences: 'Heavy starch on collars.' },
    { id: 'cust_2', name: 'Bob Williams', phone: '555-0102', preferences: 'Hypoallergenic detergent only.' },
    { id: 'cust_3', name: 'Charlie Brown', phone: '555-0103', preferences: '' },
];

let mockOrders: Order[] = [
    {
        id: 'ord_101',
        customer: mockCustomers[0],
        serviceType: 'Dry Cleaning',
        items: [
            { itemType: 'Silk Blouse', material: 'Silk', color: 'Cream', careInstruction: 'Dry Clean', price: 12.50, problems: [] },
            { itemType: 'Wool Trousers', material: 'Wool', color: 'Charcoal', careInstruction: 'Dry Clean', price: 9.00, problems: [] },
        ],
        timestamp: Date.now() - 86400000, // 1 day ago
        status: 'completed',
        deliveryType: 'Standard',
        collectionDate: new Date(Date.now() - 86400000 + 2 * 86400000).toISOString().split('T')[0],
        paymentMethod: 'Pay on Collection',
    },
     {
        id: 'ord_102',
        customer: mockCustomers[1],
        serviceType: 'Laundry',
        items: [
            { itemType: 'Cotton Sheets Set', material: 'Cotton', color: 'White', careInstruction: 'Laundry', price: 25.00, problems: [] },
        ],
        timestamp: Date.now() - 172800000, // 2 days ago
        status: 'completed',
        deliveryType: 'Express',
        collectionDate: new Date(Date.now() - 172800000 + 1 * 86400000).toISOString().split('T')[0],
        paymentMethod: 'Pay Now',
    }
];
// --- End Mock Database ---


const simulateApi = <T>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Deep copy to prevent mutation issues, simulating a real API response
            resolve(JSON.parse(JSON.stringify(data))); 
        }, API_LATENCY);
    });
};

// ====== Order Functions ======

/**
 * Simulates: GET /api/orders
 * Fetches the list of completed orders.
 */
export function fetchOrders(): Promise<Order[]> {
    // Returns a copy of the array, sorted by most recent first
    const sortedOrders = [...mockOrders].sort((a, b) => b.timestamp - a.timestamp);
    return simulateApi(sortedOrders);
}

/**
 * Simulates: POST /api/orders
 * Saves a new completed order.
 */
export function createOrder(orderData: Omit<Order, 'id'> & { id: string }): Promise<Order> {
    // In a real API, the backend would assign the final ID and timestamp.
    // Here we just accept what the frontend gives us.
    mockOrders.unshift(orderData); // Add to the beginning of the list
    return simulateApi(orderData);
}

/**
 * Simulates: DELETE /api/orders
 * Clears all orders from the history.
 */
export function clearOrders(): Promise<void> {
    mockOrders = [];
    return simulateApi(undefined);
}

// ====== Customer Functions ======

/**
 * Simulates: GET /api/customers
 * Fetches the list of all customers.
 */
export function fetchCustomers(): Promise<Customer[]> {
    return simulateApi(mockCustomers);
}

/**
 * Simulates: POST /api/customers
 * Creates a new customer.
 */
export function createCustomer(customerData: Omit<Customer, 'id'>): Promise<Customer> {
    const newCustomer: Customer = { 
        ...customerData, 
        id: `cust_${Date.now()}` // Generate a unique ID
    };
    mockCustomers.push(newCustomer);
    return simulateApi(newCustomer);
}
