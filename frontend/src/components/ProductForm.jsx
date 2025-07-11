import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const initialState = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  sku: '',
  stock: '',
  category: '',
  brand: '',
  images: [],
  isActive: true,
  isFeatured: false,
}

const ProductForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(initialState)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [uploadedImages, setUploadedImages] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialState,
        ...initialData,
        category: initialData.category?._id || '',
        brand: initialData.brand?._id || '',
        images: initialData.images || [],
      })
      setUploadedImages(initialData.images || [])
    }
  }, [initialData])

  useEffect(() => {
    // Fetch categories and brands
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          axios.get('/categories'),
          axios.get('/brands'),
        ])
        setCategories(catRes.data)
        setBrands(brandRes.data)
      } catch (err) {
        toast.error('Failed to load categories or brands')
      }
    }
    fetchData()
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
    const files = Array.from(e.target.files)
    setImageFiles(files)
    // Upload each file to /api/upload and get the URL
    const urls = []
    for (const file of files) {
      const formData = new FormData()
      formData.append('image', file)
      try {
        const res = await axios.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        urls.push(res.data.url)
      } catch (err) {
        toast.error('Image upload failed')
      }
    }
    setUploadedImages(urls)
    setForm((prev) => ({ ...prev, images: urls }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.price || isNaN(form.price)) newErrors.price = 'Valid price required'
    if (!form.sku.trim()) newErrors.sku = 'SKU is required'
    if (!form.stock || isNaN(form.stock)) newErrors.stock = 'Valid stock required'
    if (!form.category) newErrors.category = 'Category is required'
    if (!form.brand) newErrors.brand = 'Brand is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...form, images: uploadedImages })
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
          rows={3}
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className={`input-field ${errors.price ? 'border-red-500' : ''}`}
            required
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Original Price</label>
          <input
            name="originalPrice"
            type="number"
            value={form.originalPrice}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            name="sku"
            value={form.sku}
            onChange={handleChange}
            className={`input-field ${errors.sku ? 'border-red-500' : ''}`}
            required
          />
          {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Stock</label>
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            className={`input-field ${errors.stock ? 'border-red-500' : ''}`}
            required
          />
          {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={`input-field ${errors.category ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <select
            name="brand"
            value={form.brand}
            onChange={handleChange}
            className={`input-field ${errors.brand ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Select brand</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>{brand.name}</option>
            ))}
          </select>
          {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="input-field"
        />
        <div className="flex gap-2 mt-2">
          {uploadedImages.map((img, i) => (
            <img key={i} src={img} alt="preview" className="h-12 w-12 object-cover rounded" />
          ))}
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          Active
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
          Featured
        </label>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : (initialData ? 'Update' : 'Create')}</button>
      </div>
    </form>
  )
}

export default ProductForm 