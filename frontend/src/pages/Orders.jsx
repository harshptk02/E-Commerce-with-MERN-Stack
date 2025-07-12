import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaDownload } from 'react-icons/fa';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track your order history</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order._id}>
                    <td className="px-4 py-2 whitespace-nowrap">{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap font-semibold">${order.total?.toFixed(2)}</td>
                    <td className="px-4 py-2 whitespace-nowrap capitalize">{order.paymentMethod} <span className={`ml-2 text-xs px-2 py-1 rounded ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.paymentStatus}</span></td>
                    <td className="px-4 py-2 whitespace-nowrap capitalize">{order.status}</td>
                    <td className="px-4 py-2 whitespace-nowrap flex gap-2 items-center">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 shadow transition"
                        onClick={() => generateInvoice(order)}
                        title="Download Invoice"
                      >
                        <FaDownload size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setSelectedOrder(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="mb-2 text-sm text-gray-600">Order #{selectedOrder._id}</div>
            <div className="mb-2">Date: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
            <div className="mb-2">Status: <span className="capitalize">{selectedOrder.status}</span></div>
            <div className="mb-2">Payment: <span className="capitalize">{selectedOrder.paymentMethod}</span> <span className={`ml-2 text-xs px-2 py-1 rounded ${selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{selectedOrder.paymentStatus}</span></div>
            <div className="mb-2">Total: <span className="font-semibold">${selectedOrder.total?.toFixed(2)}</span></div>
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Shipping Address</h3>
              <div className="text-gray-700 text-sm">
                {selectedOrder.shippingAddress?.name}<br />
                {selectedOrder.shippingAddress?.address}<br />
                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}<br />
                {selectedOrder.shippingAddress?.country}<br />
                {selectedOrder.shippingAddress?.phone}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Items</h3>
              <ul className="divide-y divide-gray-100">
                {selectedOrder.items.map(item => (
                  <li key={item.product?._id || item.product} className="flex justify-between py-2">
                    <span>{item.product?.name || 'Product'} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 