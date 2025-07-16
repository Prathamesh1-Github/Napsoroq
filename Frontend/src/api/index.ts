import axios from 'axios';
import { Order, Customer, Product } from '../types/index';

const API_BASE_URL = 'https://neura-ops.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    "Authorization": "Bearer " + localStorage.getItem('token')
  },
});

// Order APIs
export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getInProgressOrders = async () => {
  const response = await api.get('/orders/in-progress');
  return response.data;
};

export const getCompletedOrders = async () => {
  const response = await api.get('/orders/completed');
  return response.data;
};

export const getOrder = async (id: string) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (orderData: Partial<Order>) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const deliverOrder = async (id: string, quantity: number) => {
  const response = await api.put(`/orders/deliver/${id}`, { quantity });
  return response.data;
};

export const completeOrder = async (id: string) => {
  const response = await api.put(`/orders/complete/${id}`);
  return response.data;
};

export const bulkDeliverOrders = async (orders: { id: string; quantity: number }[]) => {
  const response = await api.put('/orders/bulk-deliver', { orders });
  return response.data;
};

export const getOrdersByProduct = async () => {
  const response = await api.get('/orders/orders-by-product');
  return response.data;
};

export const getOrdersByCustomer = async () => {
  const response = await api.get('/orders/orders-by-customer');
  return response.data;
};

export const getOrderStatusMetrics = async () => {
  const response = await api.get('/orders/in-progress-metrics');
  return response.data;
};

export const getCustomerInsights = async () => {
  const response = await api.get('/orders/customer-insights');
  return response.data;
};

export const getSalesPipeline = async () => {
  const response = await api.get('/orders/sales-pipeline');
  return response.data;
};

// Customer APIs
export const getCustomers = async () => {
  const response = await api.get('/businessCustomer');
  return response.data;
};

export const createCustomer = async (customerData: Partial<Customer>) => {
  const response = await api.post('/businessCustomer', customerData);
  return response.data;
};

// Product APIs
export const getProducts = async () => {
  const response = await api.get('/product');
  return response.data;
};

export const createProduct = async (productData: Partial<Product>) => {
  const response = await api.post('/product', productData);
  return response.data;
};

export const updateProductStock = async (productId: string, quantity: number) => {
  const response = await api.post('/product/update-stock', { productId, quantity });
  return response.data;
};

// Production APIs
export const getProductionData = async () => {
  const response = await api.get('/production');
  return response.data;
};

export const getLatestProductionData = async () => {
  const response = await api.get('/production/latest');
  return response.data;
};

export const getFilteredProductionData = async (filter: string) => {
  const response = await api.get(`/production/filter/${filter}`);
  return response.data;
};

export const getTwoProductionData = async () => {
  const response = await api.get('/production/filter');
  return response.data;
};

export const getAveragedTwoProductionData = async () => {
  const response = await api.get('/production/average');
  return response.data;
};

export const getAveragedProductionDataByMachine = async () => {
  const response = await api.get('/production/machineaverage');
  return response.data;
};

// Product Production APIs
export const getProductProduction = async () => {
  const response = await api.get('/productproduction');
  return response.data;
};

export const createProductProduction = async (data: any) => {
  const response = await api.post('/productproduction', data);
  return response.data;
};

export const getProductProductionUsage = async () => {
  const response = await api.get('/productproduction/productproductionusage');
  return response.data;
};

// Raw Material APIs
export const getRawMaterials = async () => {
  const response = await api.get('/rawmaterial');
  return response.data;
};

export const createRawMaterial = async (data: any) => {
  const response = await api.post('/rawmaterial', data);
  return response.data;
};

export const updateRawMaterialStock = async (materialId: string, quantity: number) => {
  const response = await api.post('/rawmaterial/update-stock', { materialId, quantity });
  return response.data;
};

export const getLowStockMaterials = async () => {
  const response = await api.get('/rawmaterial/low-stock');
  return response.data;
};