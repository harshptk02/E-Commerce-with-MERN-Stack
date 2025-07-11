import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const initialState = {
  name: '',
  description: '',
  image: '',
  isActive: true,
}

const CategoryForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(initialState)
  const [categories, setCategories] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialState,
        ...initialData,
        image: initialData.image || '',
      })
    }
  }, [initialData])

  useEffect(() => {
    // Fetch categories for parent selection
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/categories')
        setCategories(res.data)
      } catch (err) {
        toast.error('Failed to load categories')
      }
    }
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    setImageFile(file)
    if (file) {
      const formData = new FormData()
      formData.append('image', file)
      try {
        const res = await axios.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setForm((prev) => ({ ...prev, image: res.data.url }))
        toast.success('Image uploaded')
      } catch (err) {
        toast.error('Image upload failed')
      }
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    // No need to handle image upload here, already handled in handleImageChange
    onSubmit({ ...form })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className={`input-field ${errors.name ? 'border-red-500' : ''}`}
          required
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="input-field"
          rows={2}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="input-field"
        />
        <div className="flex gap-2 mt-2">
          {form.image ? (
            <img src={form.image} alt="preview" className="h-12 w-12 object-cover rounded" />
          ) : null}
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          Active
        </label>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : (initialData ? 'Update' : 'Create')}</button>
      </div>
    </form>
  )
}

export default CategoryForm 