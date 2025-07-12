import { useState, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const AdminProfile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profilePhoto: user?.profilePhoto || '',
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const fileInputRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      profilePhoto: user?.profilePhoto || '',
    });
    setError('');
    setSuccess('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, profilePhoto: uploadRes.data.url }));
    } catch {
      setError('Failed to upload photo');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Update profile info (including photo)
      await axios.put(`/users/${user._id}`, { ...form });
      await updateProfile({ name: form.name, email: form.email, profilePhoto: form.profilePhoto });
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setError('');
    setSuccess('');
    try {
      await axios.put('/users/password', passwords);
      setShowPasswordModal(false);
      setPasswords({ oldPassword: '', newPassword: '' });
      setSuccess('Password updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
    setPasswordSaving(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600">Manage your admin account</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 max-w-lg">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-600 mb-4">{success}</div>}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center space-x-4">
              <div>
                {form.profilePhoto ? (
                  <img src={form.profilePhoto.startsWith('http') ? form.profilePhoto : `http://localhost:5000/uploads/${form.profilePhoto.replace(/^\\|\//, '')}`} alt="avatar" className="w-16 h-16 rounded-full object-cover border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                    {form.name?.[0] || user?.name?.[0] || 'A'}
                  </div>
                )}
              </div>
              {editing && (
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="block"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
                disabled={!editing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
                disabled={!editing}
                required
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
              <div className="flex space-x-2">
                {!editing ? (
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-blue-600 text-white"
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-gray-200"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-blue-600 text-white"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
              <h2 className="text-lg font-bold mb-4">Change Password</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwords.oldPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border rounded px-3 py-2"
                    placeholder="Current Password"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border rounded px-3 py-2"
                    placeholder="New Password"
                    required
                  />
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={passwordSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white"
                    disabled={passwordSaving}
                  >
                    {passwordSaving ? 'Saving...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfile; 