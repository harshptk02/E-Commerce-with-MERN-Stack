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

const Dashboard = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery('dashboardStats', async () => {
    // In a real app, you'd have a dedicated endpoint for dashboard stats
    // For now, we'll simulate the data
    return {
      totalProducts: 156,
      totalUsers: 1247,
      totalOrders: 89,
      totalRevenue: 45678.90,
      recentOrders: [
        { id: 1, customer: 'John Doe', amount: 299.99, status: 'pending' },
        { id: 2, customer: 'Jane Smith', amount: 149.99, status: 'processing' },
        { id: 3, customer: 'Bob Johnson', amount: 599.99, status: 'shipped' }
      ],
      lowStockProducts: [
        { id: 1, name: 'Wireless Headphones', stock: 3 },
        { id: 2, name: 'Smart Watch', stock: 1 },
        { id: 3, name: 'Laptop Stand', stock: 2 }
      ]
    }
  })

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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
              <FaBox className="mr-2" />
              Add New Product
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
              <FaClipboardList className="mr-2" />
              View Orders
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
              <FaChartLine className="mr-2" />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard 