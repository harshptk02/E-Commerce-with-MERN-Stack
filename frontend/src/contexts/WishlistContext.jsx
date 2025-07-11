import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist on login
  useEffect(() => {
    if (user) fetchWishlist();
    else setWishlist([]);
    // eslint-disable-next-line
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/wishlist');
      setWishlist(res.data);
    } catch (err) {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const res = await axios.post('/wishlist/add', { productId });
      setWishlist(res.data);
      toast.success('Added to wishlist');
    } catch (err) {
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await axios.delete(`/wishlist/remove/${productId}`);
      setWishlist(res.data);
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const clearWishlist = async () => {
    try {
      await axios.delete('/wishlist/clear');
      setWishlist([]);
      toast.success('Wishlist cleared');
    } catch (err) {
      toast.error('Failed to clear wishlist');
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, addToWishlist, removeFromWishlist, clearWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}; 