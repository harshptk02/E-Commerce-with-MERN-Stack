import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'password', label: 'Password' },
  { id: 'address', label: 'Shipping Address' },
];

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePhoto: '',
  });
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        profilePhoto: user.profilePhoto || '',
      });
      if (user.shippingAddress) {
        setShippingAddress(user.shippingAddress);
      } else {
        setShippingAddress({
          fullName: '',
          address: '',
          city: '',
          postalCode: '',
          country: ''
        });
      }
      setLoading(false);
    }
  }, [user]);

  // --- Profile Photo ---
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const photoUrl = uploadRes.data.url;
      const result = await updateProfile({ profilePhoto: photoUrl });
      if (!result.success) {
        throw new Error(result.message);
      }
      setProfile((prev) => ({ ...prev, profilePhoto: photoUrl }));
    } catch (err) {
      toast.error('Failed to update profile photo');
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Name & Email ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await updateProfile({ name: profile.name, email: profile.email });
      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // --- Password ---
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    try {
      await axios.put('/users/password', passwords);
      setPasswords({ oldPassword: '', newPassword: '' });
      toast.success('Password updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  // --- Shipping Address ---
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddressSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await updateProfile({ shippingAddress });
      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (err) {
      toast.error('Failed to update address');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>
      <div className="mb-6 flex gap-4 border-b">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`py-2 px-4 border-b-2 font-medium ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-24 h-24 mb-2">
                <img
                  src={profile.profilePhoto ? (profile.profilePhoto.startsWith('http') ? profile.profilePhoto : `http://localhost:5000/uploads/${profile.profilePhoto.replace(/^\\|\//, '')}`) : 'https://placehold.co/100x100?text=Photo'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="profile-photo-input"
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 text-xs hover:bg-blue-700"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={photoUploading}
                >
                  {photoUploading ? 'Uploading...' : 'Change'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700">Old Password</label>
              <input
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={passwordSaving}
            >
              {passwordSaving ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        )}
        {activeTab === 'address' && (
          <form onSubmit={handleAddressSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                name="fullName"
                value={shippingAddress.fullName}
                onChange={handleAddressChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                name="address"
                value={shippingAddress.address}
                onChange={handleAddressChange}
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
                  onChange={handleAddressChange}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleAddressChange}
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
                onChange={handleAddressChange}
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