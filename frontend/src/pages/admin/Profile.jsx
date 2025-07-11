import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

const AdminProfile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    avatar: user?.avatar || '',
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files && files[0]) {
      // For preview only, actual upload logic can be added later
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((f) => ({ ...f, avatar: ev.target.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
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
      password: '',
      avatar: user?.avatar || '',
    });
    setError('');
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const updateData = { name: form.name, email: form.email };
    if (form.password) updateData.password = form.password;
    if (form.avatar) updateData.avatar = form.avatar;
    const result = await updateProfile(updateData);
    if (result.success) {
      setSuccess('Profile updated successfully');
      setEditing(false);
    } else {
      setError(result.message || 'Failed to update profile');
    }
    setSaving(false);
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
                {form.avatar ? (
                  <img src={form.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                    {form.name?.[0] || user?.name?.[0] || 'A'}
                  </div>
                )}
              </div>
              {editing && (
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleChange}
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
            {editing && (
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                  autoComplete="new-password"
                />
              </div>
            )}
            <div className="flex justify-end space-x-2 mt-6">
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
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile; 