import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useContext } from 'react';
import { SidebarContext } from './AdminLayout';
import { useState } from 'react';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { path: '/admin', icon: 'bx bx-grid-alt', label: 'Dashboard', tooltip: 'Dashboard' },
    { path: '/admin/users', icon: 'bx bx-user', label: 'Users', tooltip: 'User' },
    { path: '/admin/orders', icon: 'bx bx-cart-alt', label: 'Orders', tooltip: 'Order' },
    { path: '/admin/products', icon: 'bx bx-box', label: 'Products', tooltip: 'Products' },
    { path: '/admin/categories', icon: 'bx bx-folder', label: 'Categories', tooltip: 'Categories' },
    { path: '/admin/brands', icon: 'bx bx-pie-chart-alt-2', label: 'Brands', tooltip: 'Brands' },
    { path: '/admin/profile', icon: 'bx bx-cog', label: 'Settings', tooltip: 'Settings' },
  ];

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };
  const cancelLogout = () => setShowLogoutModal(false);

  return (
    <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
      <div className="logo-details">
        <div className="logo_name">E-Store</div>
        <i className={`bx ${sidebarOpen ? 'bx-menu-alt-right' : 'bx-menu'}`} id="btn" onClick={() => setSidebarOpen(!sidebarOpen)}></i>
      </div>
      <ul className="nav-list">
       
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link to={item.path} className={location.pathname === item.path ? 'active' : ''}>
              <i className={item.icon}></i>
              <span className="links_name">{item.label}</span>
            </Link>
            <span className="tooltip">{item.tooltip}</span>
          </li>
        ))}
        <li className="profile">
          <div className="profile-details">
            <img
              src={user?.profilePhoto ?
                (user.profilePhoto.startsWith('http') ? user.profilePhoto : `http://localhost:5000/uploads/${user.profilePhoto.replace(/^\\|\//, '')}`)
                : 'https://placehold.co/45x45?text=User'}
              alt="profileImg"
            />
            <div className="name_job">
              <div className="name">{user?.name || 'const Genius'}</div>
              <div className="job">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Web Developer'}</div>
            </div>
          </div>
          <i className="bx bx-log-out" id="log_out" onClick={handleLogout}></i>
        </li>
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
              <h2 className="text-lg font-bold mb-4">Are you sure you want to logout?</h2>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  className="px-4 py-2 rounded bg-gray-200"
                  onClick={cancelLogout}
                >
                  No
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white"
                  onClick={confirmLogout}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </ul>
    </div>
  );
};

export default AdminSidebar; 