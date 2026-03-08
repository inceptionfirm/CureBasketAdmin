/**
 * Cart Service - Integrates with backend Cart flow
 * DTO structure based on: com.fly.canary.POJO.CartDTOs
 * Cart maps to CatalogItem: itemText1=medicineId, itemText2=customerId, itemText3=itemQuantity, itemText4=orderStatus, itemText5=orderId
 *
 * Order status flow: Customer checkout → PURCHASED; Admin sends → SHIPPED.
 * API not live yet - structure ready for integration. Test when backend is available.
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiEndpoints';

// Matches backend CartDTOs.OrderStatus (cart item level)
export type CartOrderStatus = 'IN_CART' | 'PURCHASED' | 'SHIPPED';

// Admin list/detail: orders that have been purchased or shipped
export type OrderStatus = 'PURCHASED' | 'SHIPPED';

// Matches backend MedicineDTO.MedicineFAQ
export interface MedicineFAQ {
  serialId?: string;
  question: string;
  answer: string;
}

// Matches backend MedicineDTO - nested in Cart
export interface CartMedicineDTO {
  id: number;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  manufacturer?: string;
  medicineForm?: string;
  status?: string;
  sku?: string;
  price: number;
  stock?: number;
  barcode?: string;
  prescriptionRequired?: boolean;
  countryOfOrigin?: string;
  precautions?: string;
  sideEffects?: string;
  howToUse?: string;
  medicineSalt?: string;
  medicineFaq?: MedicineFAQ[];
  files?: { docPath?: string; id?: number }[];
}

// Matches backend CartDTOs.Cart
export interface CartItem {
  id: number;
  medicineId: number;
  customerId: number;
  itemQuantity: number;
  orderStatus: CartOrderStatus;
  orderId?: string;
  medicine?: CartMedicineDTO;
}

// Admin view: one order (grouped by orderId or cart id) - purchased or shipped
export interface AdminOrder {
  id: number;
  orderId: string;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  status: OrderStatus;
  items: CartItem[];
  totalAmount?: number;
  createdAt: string;
}

// Customer info for cart lookup (name, mobile to identify customer)
export interface CustomerInfo {
  id: number;
  name?: string;
  mobile?: string;
  email?: string;
}

export interface CartListResponse {
  items: CartItem[];
  customer?: CustomerInfo;
}

export interface OrderListParams {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}

export interface OrderListResponse {
  orders: AdminOrder[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

class CartService {
  private baseEndpoint = '/cart';

  /**
   * Get the logged-in customer's cart.
   * GET /customer/cart/view-cart with Bearer token (no customerId in path).
   */
  async viewCart(): Promise<CartListResponse> {
    const response = await apiClient.get<CartListResponse>(
      API_ENDPOINTS.customer.viewCart
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch cart');
    }
    const data = response.data as any;
    return {
      items: Array.isArray(data?.items) ? data.items : Array.isArray(data?.content) ? data.content : data?.data ?? [],
      customer: data?.customer,
    };
  }

  /**
   * Get cart items for a customer by customerId (admin use).
   * Expected backend: GET /cart/get-by-customer/{customerId}
   * or similar - adjust when API spec is available.
   */
  async getCartByCustomerId(customerId: number): Promise<CartListResponse> {
    try {
      const response = await apiClient.get<CartListResponse>(
        `${this.baseEndpoint}/get-by-customer/${customerId}`
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch cart');
      }
      const data = response.data as any;
      return {
        items: Array.isArray(data?.items) ? data.items : Array.isArray(data?.content) ? data.content : data?.data || [],
        customer: data?.customer,
      };
    } catch (error) {
      console.warn('Cart API not available yet:', error);
      throw error;
    }
  }

  /**
   * Search customers by name or mobile.
   * Expected backend: GET /customer/search?name=&mobile=
   * or GET /customer/getAll - adjust when API spec is available.
   * Used to find customerId before fetching cart.
   */
  async searchCustomers(params: { name?: string; mobile?: string }): Promise<CustomerInfo[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.name?.trim()) queryParams.name = params.name.trim();
      if (params.mobile?.trim()) queryParams.mobile = params.mobile.trim();
      const response = await apiClient.get<CustomerInfo[]>(
        '/customer/search',
        queryParams
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to search customers');
      }
      const data = response.data as any;
      return Array.isArray(data) ? data : data?.content || data?.data || [];
    } catch (error) {
      console.warn('Customer search API not available yet:', error);
      throw error;
    }
  }

  /**
   * Get all orders (carts with status PURCHASED or SHIPPED).
   * Expected backend: GET /cart/get-all?status=&page=&pageSize=
   * Returns list of orders for admin to view and mark as shipped.
   */
  async getAllOrders(params: OrderListParams = {}): Promise<OrderListResponse> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params.status) queryParams.status = params.status;
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;
      const response = await apiClient.get<any>(
        API_ENDPOINTS.cart.getAll,
        queryParams as Record<string, string>
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch orders');
      }
      const data = response.data ?? ({} as any);
      const raw = data.content ?? data.data ?? data.orders ?? (Array.isArray(data) ? data : []);
      const orders: AdminOrder[] = Array.isArray(raw)
        ? raw.map((o: any) => this.normalizeOrder(o))
        : [];
      const pagination = data.pagination ?? data.pageInfo ?? {};
      return {
        orders,
        pagination: {
          page: pagination.page ?? pagination.pageNumber ?? params.page ?? 0,
          pageSize: pagination.pageSize ?? params.pageSize ?? 10,
          total: pagination.total ?? pagination.totalRecords ?? orders.length,
          totalPages: pagination.totalPages ?? 1,
        },
      };
    } catch (error) {
      console.warn('Cart get-all API not available yet:', error);
      return {
        orders: [],
        pagination: {
          page: params.page ?? 0,
          pageSize: params.pageSize ?? 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  private normalizeOrder(raw: any): AdminOrder {
    const status = (raw.status || raw.orderStatus || 'PURCHASED').toUpperCase();
    const orderStatus: OrderStatus = status === 'SHIPPED' ? 'SHIPPED' : 'PURCHASED';
    const items = Array.isArray(raw.items) ? raw.items : Array.isArray(raw.cartItems) ? raw.cartItems : [];
    let totalAmount = raw.totalAmount ?? raw.total;
    if (totalAmount == null && items.length) {
      totalAmount = items.reduce(
        (sum: number, i: any) => sum + (Number(i.medicine?.price ?? i.price ?? 0) * Number(i.itemQuantity ?? i.quantity ?? 1)),
        0
      );
    }
    return {
      id: Number(raw.id),
      orderId: String(raw.orderId ?? raw.id ?? ''),
      customerId: Number(raw.customerId ?? raw.customer?.id ?? 0),
      customerName: raw.customerName ?? raw.customer?.name,
      customerEmail: raw.customerEmail ?? raw.customer?.email,
      customerMobile: raw.customerMobile ?? raw.customer?.mobile,
      status: orderStatus,
      items,
      totalAmount: totalAmount != null ? Number(totalAmount) : undefined,
      createdAt: raw.createdAt ?? raw.orderDate ?? new Date().toISOString(),
    };
  }

  /**
   * Get single order by id for detail view.
   */
  async getOrderById(id: number): Promise<AdminOrder | null> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.cart.getById(id));
      if (!response.success || !response.data) return null;
      return this.normalizeOrder(response.data);
    } catch (error) {
      console.warn('Cart get-by-id API not available yet:', error);
      return null;
    }
  }

  /**
   * Update order status to SHIPPED (admin marks order as shipped).
   * Returns success: false when API is not available (e.g. backend not live) so UI can still update locally.
   */
  async updateOrderStatus(id: number, status: OrderStatus): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post<unknown>(
        API_ENDPOINTS.cart.updateStatus(id),
        { status }
      );
      if (!response.success) {
        return { success: false, message: response.error || 'Failed to update order status' };
      }
      return { success: true, message: response.message };
    } catch (error) {
      console.warn('Cart update-status API not available:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Failed to update order status' };
    }
  }
}

export const cartService = new CartService();
export default cartService;
