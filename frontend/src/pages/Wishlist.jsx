import { useEffect, useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!wishlist.length) {
        setProducts([]);
        return;
      }
      setFetching(true);
      try {
        // Fetch product details for all wishlisted IDs
        const res = await axios.get('/products', {
          params: { ids: wishlist.join(',') }
        });
        setProducts(res.data.products || []);
      } catch {
        setProducts([]);
      } finally {
        setFetching(false);
      }
    };
    fetchProducts();
  }, [wishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-600">Save products for later</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading || fetching ? (
          <div className="text-center py-12">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600">Start adding products to your wishlist!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product._id} className="relative group">
                <ProductCard product={product} />
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist; 