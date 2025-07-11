import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

const initialState = {
  name: '',
  description: '',
  logo: '',
  website: '',
  isActive: true,
}

const BrandForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(initialState)
  const [logoFile, setLogoFile] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialState,
        ...initialData,
        logo: initialData.logo || '',
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleLogoChange = async (e) => {
    const file = e.target.files[0]
    setLogoFile(file)
    if (file) {
      const formData = new FormData()
      formData.append('image', file)
      try {
        const res = await axios.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setForm((prev) => ({ ...prev, logo: res.data.url }))
        toast.success('Logo uploaded')
      } catch (err) {
        toast.error('Logo upload failed')
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
    // No need to handle logo upload here, already handled in handleLogoChange
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
        <label className="block text-sm font-medium text-gray-700">Website</label>
        <input
          name="website"
          value={form.website}
          onChange={handleChange}
          className="input-field"
          type="url"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Logo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="input-field"
        />
        <div className="flex gap-2 mt-2">
          {form.logo ? (
            <img src={form.logo} alt="preview" className="h-12 w-12 object-cover rounded" />
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

export default BrandForm 