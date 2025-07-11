import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import AdminLayout from '../../components/AdminLayout'
import CategoryForm from '../../components/CategoryForm'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import toast from 'react-hot-toast'

const AdminCategories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const queryClient = useQueryClient()

  // Fetch categories
  const { data: categories, isLoading } = useQuery('adminCategories', async () => {
    const response = await axios.get('/categories')
    return response.data
  })

  // Delete category mutation
  const deleteMutation = useMutation(
    (categoryId) => axios.delete(`/categories/${categoryId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCategories')
        toast.success('Category deleted successfully')
      },
      onError: () => {
        toast.error('Failed to delete category')
      }
    }
  )

  const handleDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(categoryId)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormLoading(false)
  }

  // Add or update category
  const handleFormSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (editingCategory) {
        await axios.put(`/categories/${editingCategory._id}`, formData)
        toast.success('Category updated successfully')
      } else {
        await axios.post('/categories', formData)
        toast.success('Category created successfully')
      }
      queryClient.invalidateQueries('adminCategories')
      handleModalClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category')
    } finally {
      setFormLoading(false)
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
            <p className="text-gray-600">Manage product categories</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Category
          </button>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
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
                {categories?.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      {cat.image && (
                        <img
                          src={
                            cat.image.startsWith('http')
                              ? cat.image
                              : `http://localhost:5000/uploads/${cat.image.replace(/^\\|\//, '')}`
                          }
                          alt={cat.name}
                          className="h-8 w-8 object-cover rounded"
                        />
                      )}
                      {!cat.image && (
                        <img
                          src="https://placehold.co/32x32?text=No+Image"
                          alt="No category"
                          className="h-8 w-8 object-cover rounded"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cat.description}
                    </td>
                   
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        cat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingCategory(cat)
                            setIsModalOpen(true)
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {categories?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first category.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              Add Category
            </button>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <CategoryForm
                initialData={editingCategory}
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

export default AdminCategories 