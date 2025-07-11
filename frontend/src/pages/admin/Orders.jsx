import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import AdminLayout from '../../components/AdminLayout'
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'

const statusOptions = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

const AdminOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const queryClient = useQueryClient()

  // Fetch orders
  const { data: orders, isLoading } = useQuery('adminOrders', async () => {
    const response = await axios.get('/orders')
    return response.data.orders
  })

  // Update order status mutation
  const updateStatusMutation = useMutation(
    ({ orderId, status }) => axios.put(`/orders/${orderId}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminOrders')
        toast.success('Order status updated')
        setSelectedOrder(null)
      },
      onError: () => {
        toast.error('Failed to update order status')
      },
      onSettled: () => setStatusLoading(false)
    }
  )

  const handleStatusChange = (orderId, status) => {
    setStatusLoading(true)
    updateStatusMutation.mutate({ orderId, status })
  }

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">Manage customer orders</p>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders?.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user?.name || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <FaEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {orders?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">No orders have been placed yet.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                Order Details
              </h3>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Order #:</span>
                  <span>{selectedOrder._id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">User:</span>
                  <span>{selectedOrder.user?.name} ({selectedOrder.user?.email})</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Total:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Status:</span>
                  <span>{selectedOrder.status}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Created At:</span>
                  <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Shipping Address:</span>
                  <span>{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}</span>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{item.product?.name || '—'}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">${item.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="input-field"
                    disabled={statusLoading}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {statusLoading && <span className="ml-2 animate-spin h-5 w-5 border-b-2 border-primary-600 rounded-full"></span>}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                  disabled={statusLoading}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminOrders 