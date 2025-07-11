import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart, getCartTotal, clearCart, loading } = useCart();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({
    name: '', address: '', city: '', postalCode: '', country: '', phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e, paymentStatus = 'pending') => {
    if (e) e.preventDefault();
    setPlacing(true);
    setError('');
    try {
      const order = {
        items: cart.map(item => ({ product: item._id, quantity: item.quantity, price: item.price })),
        shippingAddress: shipping,
        paymentMethod,
        paymentStatus,
      };
      const res = await axios.post('/orders', order);
      await clearCart();
      navigate(`/order-confirmation/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const handlePayNow = async () => {
    setPaid(true);
    setTimeout(() => {
      handlePlaceOrder(null, 'paid');
    }, 1200); // Simulate payment delay
  };

  // Defensive: cart must be an array and not empty
  const isCartValid = Array.isArray(cart) && cart.length > 0;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-2xl font-bold text-gray-900 mb-4">Loading your cart...</div>
      </div>
    );
  }

  if (!isCartValid) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some products to your cart before proceeding to checkout.</p>
        <button
          className="px-6 py-3 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
          onClick={() => navigate('/products')}
        >
          Go to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
      <form onSubmit={e => handlePlaceOrder(e, paymentMethod === 'cod' ? 'pending' : 'paid')} className="space-y-8">
        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" value={shipping.name} onChange={handleChange} required placeholder="Full Name" className="input-field" />
            <input name="phone" value={shipping.phone} onChange={handleChange} required placeholder="Phone" className="input-field" />
            <input name="address" value={shipping.address} onChange={handleChange} required placeholder="Address" className="input-field md:col-span-2" />
            <input name="city" value={shipping.city} onChange={handleChange} required placeholder="City" className="input-field" />
            <input name="postalCode" value={shipping.postalCode} onChange={handleChange} required placeholder="Postal Code" className="input-field" />
            <input name="country" value={shipping.country} onChange={handleChange} required placeholder="Country" className="input-field" />
          </div>
        </div>
        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Payment Method</h2>
          <label className="flex items-center gap-2">
            <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
            Cash on Delivery
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
            Online Payment (Demo)
          </label>
        </div>
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cart.length === 0 ? (
            <div className="text-gray-600">Your cart is empty.</div>
          ) : (
            <ul className="divide-y divide-gray-100 mb-4">
              {cart.map(item => (
                <li key={item._id} className="flex justify-between py-2">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>
        </div>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div className="flex justify-end">
          {paymentMethod === 'online' ? (
            <button
              type="button"
              className="px-6 py-3 rounded bg-green-600 text-white font-bold hover:bg-green-700 transition"
              onClick={handlePayNow}
              disabled={placing || paid || cart.length === 0}
            >
              {paid ? 'Processing Payment...' : 'Pay Now'}
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-3 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
              disabled={placing || cart.length === 0}
            >
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Checkout; 