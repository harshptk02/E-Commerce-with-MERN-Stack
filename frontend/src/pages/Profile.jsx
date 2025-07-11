import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch current user profile
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/users/me');
        if (res.data.shippingAddress) {
          setShippingAddress(res.data.shippingAddress);
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/users/address', { shippingAddress });
      toast.success('Shipping address updated');
    } catch (err) {
      toast.error('Failed to update address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                name="fullName"
                value={shippingAddress.fullName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                name="address"
                value={shippingAddress.address}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                name="country"
                value={shippingAddress.country}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile; 