/**
 * Mock cart/order data for admin Cart page when backend get-all is not available.
 * Matches AdminOrder and CartItem types from cartService.
 */

import type { AdminOrder, CartItem, OrderStatus } from '../../services/cartService';

export const MOCK_ORDERS: AdminOrder[] = [
  {
    id: 1,
    orderId: 'ORD-001',
    customerId: 101,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerMobile: '+91 98765 43210',
    status: 'PURCHASED',
    totalAmount: 1250,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 1,
        medicineId: 201,
        customerId: 101,
        itemQuantity: 2,
        orderStatus: 'PURCHASED',
        orderId: 'ORD-001',
        medicine: {
          id: 201,
          name: 'Paracetamol 500mg',
          price: 50,
          description: 'Pain relief',
        },
      },
      {
        id: 2,
        medicineId: 202,
        customerId: 101,
        itemQuantity: 1,
        orderStatus: 'PURCHASED',
        orderId: 'ORD-001',
        medicine: {
          id: 202,
          name: 'Vitamin C 1000mg',
          price: 350,
          description: 'Immunity support',
        },
      },
    ] as CartItem[],
  },
  {
    id: 2,
    orderId: 'ORD-002',
    customerId: 102,
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerMobile: '+91 91234 56789',
    status: 'SHIPPED',
    totalAmount: 890,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 3,
        medicineId: 203,
        customerId: 102,
        itemQuantity: 3,
        orderStatus: 'SHIPPED',
        orderId: 'ORD-002',
        medicine: {
          id: 203,
          name: 'Cetirizine 10mg',
          price: 30,
          description: 'Allergy relief',
        },
      },
    ] as CartItem[],
  },
  {
    id: 3,
    orderId: 'ORD-003',
    customerId: 103,
    customerName: 'Alex Kumar',
    customerMobile: '+91 99887 76655',
    status: 'PURCHASED',
    totalAmount: 2100,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 4,
        medicineId: 204,
        customerId: 103,
        itemQuantity: 1,
        orderStatus: 'PURCHASED',
        orderId: 'ORD-003',
        medicine: {
          id: 204,
          name: 'Multivitamin Tablets',
          price: 450,
          description: 'Daily multivitamin',
        },
      },
      {
        id: 5,
        medicineId: 205,
        customerId: 103,
        itemQuantity: 2,
        orderStatus: 'PURCHASED',
        orderId: 'ORD-003',
        medicine: {
          id: 205,
          name: 'Omeprazole 20mg',
          price: 120,
          description: 'Acid reflux',
        },
      },
    ] as CartItem[],
  },
];
