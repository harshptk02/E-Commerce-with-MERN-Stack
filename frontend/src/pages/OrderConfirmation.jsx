import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="max-w-2xl mx-auto py-16 text-center">Loading...</div>;
  }
  if (error || !order) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-red-500">{error || 'Order not found.'}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600 mb-2">Thank you for your order!</h1>
        <p className="text-gray-700 mb-2">Your order has been placed successfully.</p>
        <div className="text-lg font-semibold mb-2">Order #{order._id}</div>
        <Link to="/" className="text-blue-600 hover:underline">Continue Shopping</Link>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
        <ul className="divide-y divide-gray-100 mb-4">
          {order.items.map(item => (
            <li key={item.product?._id || item.product} className="flex justify-between py-2">
              <span>{item.product?.name || 'Product'} x {item.quantity}</span>
              <span>${(item.product?.price || 0 * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${order.total?.toFixed(2) || 'N/A'}</span>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold mb-1">Shipping Address</h3>
          <div className="text-gray-700 text-sm">
            {order.shippingAddress?.name}<br />
            {order.shippingAddress?.address}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
            {order.shippingAddress?.country}<br />
            {order.shippingAddress?.phone}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-1">Payment Method</h3>
          <div className="text-gray-700 text-sm capitalize">{order.paymentMethod}</div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 