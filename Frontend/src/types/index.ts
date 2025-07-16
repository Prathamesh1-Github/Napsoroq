export interface Payment {
  _id: string;
  amount: number;
  date: string;
  mode: string;
  notes?: string;
  transactionId?: string;
}

export interface AdvancePayment {
  amount: number;
  date: string;
  mode: string;
  transactionId?: string;
}

export interface Order {
  _id: string;
  customerId: Customer;
  productId: Product;
  quantityOrdered: number;
  quantityDelivered: number;
  remainingQuantity: number;
  orderDate: string;
  deliveryDate: string;
  sellingPrice: number;
  deliveryCost: number;
  orderCompletionDate?: string;
  status: 'In Progress' | 'Completed';
  financialStatus?: string;
  totalOrderValue?: number;
  totalPaidAmount?: number;
  pendingAmount?: number;
  advancePayment?: AdvancePayment;
  payments?: Payment[];
}
  
  export interface Customer {
    _id: string;
    customerName: string;
    contactPerson: string;
    phoneNumber: string;
    email: string;
    companyAddress: string;
    gstNumber: string;
    fssaiNumber: string;
    cinNumber: string;
    preferredPaymentTerms: string;
    creditOfPayment: string;
    orderFrequency: string;
    createdAt: string;
    productsOrdered?: {
      productId: string;
      productName: string;
      averageQuantity: number;
    }[];
  }
  
  export interface Product {
    _id: string;
    productId: string;
    productName: string;
    productCategory: string;
    productSKU: string;
    sellingPrice: number;
    currentStock: number;
    minimumStockLevel: number;
  }