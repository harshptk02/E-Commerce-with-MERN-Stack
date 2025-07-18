import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaDownload } from 'react-icons/fa';

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

  const generateInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Order Invoice', 14, 18);
    doc.setFontSize(12);
    doc.text(`Order #: ${order._id}`, 14, 28);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 36);
    doc.text(`Payment Method: ${order.paymentMethod}`, 14, 44);

    // Shipping Address
    doc.setFontSize(14);
    doc.text('Shipping Address:', 14, 54);
    doc.setFontSize(12);
    const addr = order.shippingAddress || {};
    doc.text(`Name: ${addr.name || 'N/A'}`, 14, 62);
    doc.text(`Phone: ${addr.phone || 'N/A'}`, 14, 68);
    doc.text(`Address: ${addr.address || 'N/A'}`, 14, 74);
    doc.text(`City: ${addr.city || 'N/A'}`, 14, 80);
    doc.text(`Postal Code: ${addr.postalCode || 'N/A'}`, 14, 86);
    doc.text(`Country: ${addr.country || 'N/A'}`, 14, 92);

    // Items Table
    autoTable(doc, {
      startY: 100,
      head: [['Product', 'Qty', 'Price', 'Total']],
      body: order.items.map(item => [
        item.product?.name || 'Product',
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `$${(item.price * item.quantity).toFixed(2)}`
      ]),
    });

    // Totals
    const finalY = doc.lastAutoTable?.finalY || 120;
    doc.setFontSize(14);
    doc.text(`Total: $${order.total?.toFixed(2) || 'N/A'}`, 14, finalY + 10);

    doc.save(`invoice_${order._id}.pdf`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600 mb-2">Thank you for your order!</h1>
        <p className="text-gray-700 mb-2">Your order has been placed successfully.</p>
        <div className="text-lg font-semibold mb-2">Order #{order._id}</div>
        <Link to="/" className="text-blue-600 hover:underline">Continue Shopping</Link>
      </div>
      <div className="relative bg-white rounded-lg shadow-md p-6 space-y-4">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 shadow absolute right-6 top-6 z-10"
          onClick={() => generateInvoice(order)}
        >
          <FaDownload />
          Download Invoice
        </button>
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
          <div className="text-gray-700 text-sm space-y-1 text-left">
            <div><span className="font-medium">Name:</span> {order.shippingAddress?.name || 'N/A'}</div>
            <div><span className="font-medium">Phone:</span> {order.shippingAddress?.phone || 'N/A'}</div>
            <div><span className="font-medium">Address:</span> {order.shippingAddress?.address || 'N/A'}</div>
            <div><span className="font-medium">City:</span> {order.shippingAddress?.city || 'N/A'}</div>
            <div><span className="font-medium">Postal Code:</span> {order.shippingAddress?.postalCode || 'N/A'}</div>
            <div><span className="font-medium">Country:</span> {order.shippingAddress?.country || 'N/A'}</div>
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