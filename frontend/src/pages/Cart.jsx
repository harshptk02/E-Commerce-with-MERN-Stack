import { useCart } from '../contexts/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, getCartTotal, loading } = useCart();
  const navigate = useNavigate()
  const [updating, setUpdating] = useState(null)
  const [removing, setRemoving] = useState(null)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          Loading cart...
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (productId, quantity) => {
    setUpdating(productId)
    await updateCartItem(productId, quantity)
    setUpdating(null)
  }

  const handleRemove = async (productId) => {
    setRemoving(productId)
    await removeFromCart(productId)
    setRemoving(null)
  }

  const getImage = (item) => {
    if (Array.isArray(item.images) && item.images[0]) {
      return item.images[0]
    }
    return 'https://via.placeholder.com/60x60?text=No+Image'
  }

  // Defensive: cart must be an array
  const isCartValid = Array.isArray(cart)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">Review your items and proceed to checkout</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        {isCartValid && cart.length > 0 ? (
          <div>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {cart.map(item => (
                    <tr key={item._id}>
                      <td className="px-4 py-2 whitespace-nowrap flex items-center gap-3">
                        <img src={getImage(item)} alt={item.name} className="w-12 h-12 rounded object-cover border" />
                        <Link to={`/products/${item._id}`} className="font-medium text-gray-900 hover:text-primary-600">
                          {item.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : 'N/A'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            className="px-2 py-1 rounded bg-gray-200 text-lg font-bold"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={updating === item._id || item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={item.stock}
                            value={item.quantity}
                            onChange={e => handleQuantityChange(item._id, Number(e.target.value))}
                            className="w-16 border rounded px-2 py-1 text-center"
                            disabled={updating === item._id}
                          />
                          <button
                            className="px-2 py-1 rounded bg-gray-200 text-lg font-bold"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={updating === item._id || item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap font-semibold">{typeof item.price === 'number' ? `$${(item.price * item.quantity).toFixed(2)}` : 'N/A'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="text-red-600 hover:underline"
                          disabled={removing === item._id}
                        >
                          {removing === item._id ? 'Removing...' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-lg font-semibold">Total: ${getCartTotal().toFixed(2)}</div>
              <button
                className="px-6 py-3 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        ) : isCartValid ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600">Add some products to get started!</p>
          </div>
        ) : (
          <div className="text-center py-12 text-red-500">
            Failed to load cart. Please log in and try again.
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart 