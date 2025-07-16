import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, DollarSign, Package } from 'lucide-react';
import { getInProgressOrders, getOrderStatusMetrics } from '../../api/index';
import { Order } from '../../types/index';
import { Card } from '../ui/card';

interface OrderMetrics {
  totalOrders: number;
  totalValue: number;
  delayedOrders: number;
  onTimeDeliveries: number;
}

function OrdersInProgress() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<OrderMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, metricsData] = await Promise.all([
          getInProgressOrders(),
          getOrderStatusMetrics()
        ]);
        setOrders(ordersData.orders);
        setMetrics(metricsData);
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  const totalPendingValue = orders.reduce((acc, order) => acc + (order.remainingQuantity * order.sellingPrice), 0);

  return (
    <div className="p-6 mx-auto w-screen">
      <h1 className="text-3xl font-bold mb-8">Orders In Progress</h1>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className=" p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-4">
            <Package className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-300">Total Orders</p>
              <p className="text-2xl font-semibold">{metrics?.totalOrders || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className=" p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-4">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-300">Pending Delivery Value</p>
              <p className="text-2xl font-semibold">₹{totalPendingValue.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className=" p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-300">Delayed Orders</p>
              <p className="text-2xl font-semibold">{metrics?.delayedOrders || 0}</p>
            </div>
          </div>
        </Card>

        <Card className=" p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <div> 
              <p className="text-sm text-gray-300">Possible On-Time Deliveries</p>
              <p className="text-2xl font-semibold">{metrics?.onTimeDeliveries || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <div className=" rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Delivery Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Update</th>
            </tr>
          </thead>
          <tbody className=" divide-y divide-gray-200">
            {orders.map((order) => {
              const isDelayed = new Date(order.deliveryDate) < new Date();
              
              return (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">#{order._id.slice(-6)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.customerId.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.productId.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.quantityDelivered} / {order.quantityOrdered}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {format(new Date(order.deliveryDate), 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      isDelayed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {isDelayed ? 'Delayed' : 'On Track'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <Link 
                      to={`/orders/${order._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </Link>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <Link 
                      to={`/editorder/${order._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Update
                    </Link>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrdersInProgress;