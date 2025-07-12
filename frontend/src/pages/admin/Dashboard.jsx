import { useQuery } from 'react-query'
import axios from 'axios'
import AdminLayout from '../../components/AdminLayout'
import { 
  FaBox, 
  FaUsers, 
  FaClipboardList, 
  FaDollarSign,
  FaChartLine,
  FaExclamationTriangle
} from 'react-icons/fa'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'

const Dashboard = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading, error } = useQuery('dashboardStats', async () => {
    const res = await axios.get('/admin/dashboard');
    // Map backend data to expected frontend structure
    return {
      totalProducts: res.data.totalProducts,
      totalUsers: res.data.totalUsers,
      totalOrders: res.data.totalOrders,
      totalRevenue: res.data.totalRevenue,
      recentOrders: res.data.recentOrders.map(order => ({
        id: order._id,
        customer: order.user?.name || 'Unknown',
        amount: order.total,
        status: order.status
      })),
      lowStockProducts: res.data.lowStockProducts.map(product => ({
        id: product._id,
        name: product.name,
        stock: product.stock
      }))
    };
  });

  // Fetch monthly revenue and order stats
  const { data: overview, isLoading: loadingOverview } = useQuery('dashboardOverview', async () => {
    const res = await axios.get('/admin/stats/overview');
    // Format: [{ year, month, totalRevenue, orderCount }]
    return res.data.stats.map(s => ({
      ...s,
      label: `${s.year}-${String(s.month).padStart(2, '0')}`
    }));
  });

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
            <p className="text-gray-600">{error.message || 'Failed to load dashboard data.'}</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>

      
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={FaBox}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={FaUsers}
            color="bg-green-500"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={FaClipboardList}
            color="bg-yellow-500"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={FaDollarSign}
            color="bg-purple-500"
          />
        </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue (Last 12 Months)</h3>
            {loadingOverview ? (
              <div className="text-center py-8">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={overview} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders (Last 12 Months)</h3>
            {loadingOverview ? (
              <div className="text-center py-8">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={overview} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orderCount" fill="#82ca9d" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>


        {/* Recent Orders and Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500">Order #{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${order.amount}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaExclamationTriangle className="mr-2 text-red-500" />
                Low Stock Products
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">Product ID: {product.id}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock === 1 ? 'bg-red-100 text-red-800' :
                        product.stock === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.stock} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </AdminLayout>
  )
}

export default Dashboard 