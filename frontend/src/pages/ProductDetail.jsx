import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import toast from 'react-hot-toast'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await axios.get(`/products/${id}`)
        setProduct(res.data)
      } catch (err) {
        setError('Failed to fetch product details')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (product) {
      setIsWishlisted(wishlist.includes(product._id))
    }
  }, [wishlist, product])

  const getImage = () => {
    const url = Array.isArray(product?.images) && product.images[0] ? product.images[0] : ''
    if (
      url &&
      (url.startsWith('http://') || url.startsWith('https://')) &&
      !url.startsWith('blob:')
    ) {
      return url
    }
    if (url && !url.startsWith('blob:')) {
      return `http://localhost:5000/uploads/${url.replace(/^\\|\//, '')}`
    }
    return 'https://placehold.net/400x400.png'
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart')
      return
    }
    setIsAddingToCart(true)
    try {
      const result = await addToCart(product._id, 1)
      if (result.success) {
        navigate('/cart')
      }
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistClick = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist')
      return
    }
    if (isWishlisted) {
      await removeFromWishlist(product._id)
    } else {
      await addToWishlist(product._id)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto py-16 text-center">Loading...</div>
  }
  if (error || !product) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-red-500">{error || 'Product not found.'}</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="flex-shrink-0 w-full md:w-1/2 flex items-center justify-center">
          <img
            src={getImage()}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg border"
          />
        </div>
        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{product.category?.name}</span>
              <span className="text-sm text-gray-500">{product.brand?.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`w-5 h-5 ${index < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">({product.numReviews})</span>
            </div>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            <div className="mb-4">
              {product.stock > 0 ? (
                <span className="text-sm text-green-600 font-medium">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-sm text-red-600 font-medium">Out of Stock</span>
              )}
            </div>
            <p className="text-gray-700 mb-4">{product.description}</p>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className="btn-primary flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isAddingToCart ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <FaShoppingCart className="mr-2" />
                  Add to Cart
                </>
              )}
            </button>
            <button
              onClick={handleWishlistClick}
              className={`p-3 rounded-full transition-colors ${
                isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
              }`}
            >
              <FaHeart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail 