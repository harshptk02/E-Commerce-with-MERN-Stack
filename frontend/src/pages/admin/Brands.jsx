import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import AdminLayout from '../../components/AdminLayout'
import BrandForm from '../../components/BrandForm'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import toast from 'react-hot-toast'

const AdminBrands = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const queryClient = useQueryClient()

  // Fetch brands
  const { data: brands, isLoading } = useQuery('adminBrands', async () => {
    const response = await axios.get('/brands')
    return response.data
  })

  // Delete brand mutation
  const deleteMutation = useMutation(
    (brandId) => axios.delete(`/brands/${brandId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminBrands')
        toast.success('Brand deleted successfully')
      },
      onError: () => {
        toast.error('Failed to delete brand')
      }
    }
  )

  const handleDelete = (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      deleteMutation.mutate(brandId)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingBrand(null)
    setFormLoading(false)
  }

  // Add or update brand
  const handleFormSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (editingBrand) {
        await axios.put(`/brands/${editingBrand._id}`, formData)
        toast.success('Brand updated successfully')
      } else {
        await axios.post('/brands', formData)
        toast.success('Brand created successfully')
      }
      queryClient.invalidateQueries('adminBrands')
      handleModalClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save brand')
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
            <h1 className="text-3xl font-bold text-gray-900">Brands Management</h1>
            <p className="text-gray-600">Manage product brands</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Brand
          </button>
        </div>

        {/* Brands Table */}
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
                    Website
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
                {brands?.map((brand) => (
                  <tr key={brand._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      {brand.logo && <img src={brand.logo} alt={brand.name} className="h-8 w-8 object-cover rounded" />}
                      <span className="text-sm font-medium text-gray-900">{brand.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {brand.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 underline">
                      {brand.website ? <a href={brand.website} target="_blank" rel="noopener noreferrer">{brand.website}</a> : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        brand.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {brand.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingBrand(brand)
                            setIsModalOpen(true)
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(brand._id)}
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
        {brands?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first brand.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              Add Brand
            </button>
          </div>
        )}
      </div>

      {/* Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h3>
              <BrandForm
                initialData={editingBrand}
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

export default AdminBrands 