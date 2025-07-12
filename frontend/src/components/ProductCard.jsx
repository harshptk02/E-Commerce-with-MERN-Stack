import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    setIsWishlisted(wishlist.includes(product._id))
  }, [wishlist, product._id])

  const getImage = () => {
    const url = Array.isArray(product.images) && product.images[0] ? product.images[0] : ''
    if (
      url &&
      (url.startsWith('http://') || url.startsWith('https://')) &&
      !url.startsWith('blob:')
    ) {
      return url
    }
    // Use a full placeholder image URL
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

  return (
    <div className="card group hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={getImage()}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isWishlisted 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
          }`}
        >
          <FaHeart size={16} />
        </button>
        {/* Discount Badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className="p-4">
        {/* Category and Brand */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{product.category?.name}</span>
          <span className="text-sm text-gray-500">{product.brand?.name}</span>
        </div>
        {/* Product Name */}
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`w-4 h-4 ${
                  index < Math.floor(product.rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            ({product.numReviews})
          </span>
        </div>
        {/* Price */}
        <div className="flex items-center mb-4">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through ml-2">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        {/* Stock Status */}
        <div className="mb-4">
          {product.stock > 0 ? (
            <span className="text-sm text-green-600 font-medium">
              In Stock ({product.stock} available)
            </span>
          ) : (
            <span className="text-sm text-red-600 font-medium">
              Out of Stock
            </span>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
            className="flex-1 btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
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
        </div>
      </div>
    </div>
  )
}

export default ProductCard 