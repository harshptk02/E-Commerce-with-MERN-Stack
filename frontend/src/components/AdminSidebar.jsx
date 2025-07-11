import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useContext } from 'react';
import { SidebarContext } from './AdminLayout';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);

  const menuItems = [
    { path: '/admin', icon: 'bx bx-grid-alt', label: 'Dashboard', tooltip: 'Dashboard' },
    { path: '/admin/users', icon: 'bx bx-user', label: 'Users', tooltip: 'User' },
    { path: '/admin/orders', icon: 'bx bx-cart-alt', label: 'Orders', tooltip: 'Order' },
    { path: '/admin/products', icon: 'bx bx-box', label: 'Products', tooltip: 'Products' },
    { path: '/admin/categories', icon: 'bx bx-folder', label: 'Categories', tooltip: 'Categories' },
    { path: '/admin/brands', icon: 'bx bx-pie-chart-alt-2', label: 'Brands', tooltip: 'Brands' },
    { path: '/admin/profile', icon: 'bx bx-cog', label: 'Settings', tooltip: 'Settings' },
  ];

  const handleLogout = () => logout();

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
            <img src="https://placehold.co/45x45" alt="profileImg" />
            <div className="name_job">
              <div className="name">{user?.name || 'const Genius'}</div>
              <div className="job">Web Developer</div>
            </div>
          </div>
          <i className="bx bx-log-out" id="log_out" onClick={handleLogout}></i>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar; 