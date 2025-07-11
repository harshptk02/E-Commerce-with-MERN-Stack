import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import AdminLayout from '../../components/AdminLayout'
import ProductForm from '../../components/ProductForm'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import toast from 'react-hot-toast'

const AdminProducts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const queryClient = useQueryClient()

  // Fetch products
  const { data: products, isLoading } = useQuery('adminProducts', async () => {
    const response = await axios.get('/products')
    return response.data.products
  })

  // Delete product mutation
  const deleteMutation = useMutation(
    (productId) => axios.delete(`/products/${productId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminProducts')
        toast.success('Product deleted successfully')
      },
      onError: () => {
        toast.error('Failed to delete product')
      }
    }
  )

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(productId)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setFormLoading(false)
  }

  // Add or update product
  const handleFormSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (editingProduct) {
        await axios.put(`/products/${editingProduct._id}`, formData)
        toast.success('Product updated successfully')
      } else {
        await axios.post('/products', formData)
        toast.success('Product created successfully')
      }
      queryClient.invalidateQueries('adminProducts')
      handleModalClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally {
      setFormLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products?.map((product) => {
                  // Robust image selection
                  const getImage = () => {
                    const url = Array.isArray(product.images) && product.images[0] ? product.images[0] : '';
                    if (
                      url &&
                      (url.startsWith('http://') || url.startsWith('https://')) &&
                      !url.startsWith('blob:')
                    ) {
                      return url;
                    }
                    if (url && !url.startsWith('blob:')) {
                      // Assume it's a filename or relative path, prepend backend URL
                      return `http://localhost:5000/uploads/${url.replace(/^\\|\//, '')}`;
                    }
                    return 'https://placehold.net/400x400.png';
                  };
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={getImage()}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.brand?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product)
                              setIsModalOpen(true)
                            }}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {products?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first product.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              Add Product
            </button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <ProductForm
                initialData={editingProduct}
                onSubmit={handleFormSubmit}
                onCancel={handleModalClose}
                loading={formLoading}
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminProducts 