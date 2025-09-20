export interface OrderTargetData {
  achieved: number;
  target: number;
  period: string;
  lastUpdated: string;
}

export interface DashboardMetrics {
  totalOrders: number;
  totalBuyers: number;
  totalRevenue: number;
  conversionRate: number;
  period: string;
}

export interface OrderHistoryItem {
  orderId: string;
  status: 'pending' | 'completed' | 'cancelled' | 'processing';
  date: string;
  amount?: number;
  customerName?: string;
}

class DashboardService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  }

  async getOrderTargetData(period: string = 'August'): Promise<OrderTargetData> {
    return this.getMockOrderTargetData(period);
  }

  async getDashboardMetrics(period: string = '7 days'): Promise<DashboardMetrics> {
    return this.getMockDashboardMetrics(period);
  }

  async getOrderHistory(fromDate?: string, toDate?: string): Promise<OrderHistoryItem[]> {
    return this.getMockOrderHistory();
  }

  private getMockOrderTargetData(period: string): OrderTargetData {
    const mockData: Record<string, OrderTargetData> = {
      'August': { achieved: 46732, target: 50000, period: 'August', lastUpdated: new Date().toISOString() },
      'July': { achieved: 42350, target: 45000, period: 'July', lastUpdated: new Date().toISOString() },
      'June': { achieved: 38920, target: 40000, period: 'June', lastUpdated: new Date().toISOString() },
      'September': { achieved: 12500, target: 55000, period: 'September', lastUpdated: new Date().toISOString() }
    };
    
    return mockData[period] || mockData['August'];
  }

  private getMockDashboardMetrics(period: string): DashboardMetrics {
    const mockData: Record<string, DashboardMetrics> = {
      '7 days': { totalOrders: 65, totalBuyers: 43, totalRevenue: 12500, conversionRate: 3.2, period: '7 days' },
      '30 days': { totalOrders: 280, totalBuyers: 195, totalRevenue: 52000, conversionRate: 3.5, period: '30 days' },
      '90 days': { totalOrders: 850, totalBuyers: 620, totalRevenue: 156000, conversionRate: 3.8, period: '90 days' }
    };
    
    return mockData[period] || mockData['7 days'];
  }

  private getMockOrderHistory(): OrderHistoryItem[] {
    return [
      { orderId: '#182728', status: 'pending', date: '2024-01-26', amount: 125.50, customerName: 'John Doe' },
      { orderId: '#182729', status: 'completed', date: '2024-01-25', amount: 89.99, customerName: 'Jane Smith' },
      { orderId: '#182730', status: 'processing', date: '2024-01-24', amount: 234.75, customerName: 'Bob Johnson' },
      { orderId: '#182731', status: 'completed', date: '2024-01-23', amount: 67.25, customerName: 'Alice Brown' },
      { orderId: '#182732', status: 'cancelled', date: '2024-01-22', amount: 156.00, customerName: 'Charlie Wilson' }
    ];
  }

  async updateOrderTarget(period: string, target: number): Promise<OrderTargetData> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/order-target`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period, target }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order target:', error);
      throw error;
    }
  }
}

export default new DashboardService();

