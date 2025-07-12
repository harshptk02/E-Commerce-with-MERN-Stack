import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const swiperRef = useRef(null)
  const heroSwiperRef = useRef(null)

  // Fetch featured products
  const { data: products, isLoading } = useQuery('featuredProducts', async () => {
    const response = await axios.get('/products?limit=8&isFeatured=true')
    return response.data.products
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/categories')
        setCategories(res.data)
      } catch {}
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (products) {
      setFeaturedProducts(products)
    }
  }, [products])

  // Swiper initialization for hero section slider
  useEffect(() => {
    if (window.Swiper) {
      if (heroSwiperRef.current && heroSwiperRef.current.destroy) {
        heroSwiperRef.current.destroy(true, true)
      }
      heroSwiperRef.current = new window.Swiper('.default-carousel', {
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.default-carousel .swiper-button-next',
          prevEl: '.default-carousel .swiper-button-prev',
        },
      })
    }
    return () => {
      if (heroSwiperRef.current && heroSwiperRef.current.destroy) {
        heroSwiperRef.current.destroy(true, true)
      }
    }
  }, [])

  // Swiper initialization for product slider
  useEffect(() => {
    if (window.Swiper && featuredProducts.length > 0) {
      if (swiperRef.current && swiperRef.current.destroy) {
        swiperRef.current.destroy(true, true)
      }
      swiperRef.current = new window.Swiper('.multiple-slide-carousel', {
        loop: true,
        slidesPerView: 4,
        spaceBetween: 20,
        navigation: {
          nextEl: '.multiple-slide-carousel .swiper-button-next',
          prevEl: '.multiple-slide-carousel .swiper-button-prev',
        },
        breakpoints: {
          1920: { slidesPerView: 4, spaceBetween: 30 },
          1280: { slidesPerView: 4, spaceBetween: 30 },
          1028: { slidesPerView: 2, spaceBetween: 20 },
          640: { slidesPerView: 1, spaceBetween: 10 },
        },
      })
    }
    return () => {
      if (swiperRef.current && swiperRef.current.destroy) {
        swiperRef.current.destroy(true, true)
      }
    }
  }, [featuredProducts])

  return (
    <div>
      {/* Hero Section */}
      <section>


        <div className="w-full relative">
          <div className="swiper default-carousel swiper-container">
            <div className="swiper-wrapper">
              <div className="swiper-slide">
                <div className="bg-[url('https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/d4ed712237c93c98.jpg?q=60')] bg-cover bg-center bg-no-repeat h-96 flex justify-center items-center">

                </div>
              </div>
              <div className="swiper-slide">
                <div className="bg-[url('https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/2f3f2d4ce05074c7.jpeg?q=60')] bg-cover bg-center bg-no-repeat h-96 flex justify-center items-center">

                </div>
              </div>
              <div className="swiper-slide">
                <div className="bg-[url('https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/c67c045223c5be6d.jpg?q=60')] bg-cover bg-center bg-no-repeat h-96 flex justify-center items-center">

                </div>
              </div>
            </div>
            <div className="flex items-center gap-8 lg:justify-start justify-center">
              <button id="slider-button-left" className="swiper-button-prev group !p-2 flex justify-center items-center border border-solid border-white !w-12 !h-12 transition-all duration-500 rounded-full !top-2/4 !-translate-y-8 !left-5 hover:bg-white " data-carousel-prev>
                <svg className="h-5 w-5 text-white group-hover:text-black" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M10.0002 11.9999L6 7.99971L10.0025 3.99719" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button id="slider-button-right" className="swiper-button-next group !p-2 flex justify-center items-center border border-solid border-white !w-12 !h-12 transition-all duration-500 rounded-full !top-2/4 !-translate-y-8  !right-5 hover:bg-white" data-carousel-next>
                <svg className="h-5 w-5 text-white group-hover:text-black" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M5.99984 4.00012L10 8.00029L5.99748 12.0028" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="swiper-pagination"></div>
          </div>
        </div>

      </section>
      {/* Category Gallery */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map(cat => (
              <div key={cat._id} className="flex flex-col items-center group cursor-pointer hover:shadow-lg transition-shadow rounded-lg p-4 bg-gray-50">
                <div className="w-24 h-24 mb-3 rounded-full overflow-hidden border-2 border-primary-100 flex items-center justify-center bg-white">
                  <img
                    src={cat.image && (cat.image.startsWith('http://') || cat.image.startsWith('https://')) ? cat.image : cat.image ? `http://localhost:5000/uploads/${cat.image.replace(/^\\|\//, '')}` : 'https://placehold.co/100x100?text=No+Image'}
                    alt={cat.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-base font-semibold text-gray-800 text-center mt-2">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Product Slider */}
      <div className="mt-16 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="w-full relative">
          <div className="swiper multiple-slide-carousel swiper-container relative">
            <div className="swiper-wrapper mb-16">
              {featuredProducts.map(product => (
                <div className="swiper-slide" key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            <div className="absolute flex justify-center items-center m-auto left-0 right-0 w-fit bottom-12">
              <button className="swiper-button-prev group !p-2 flex justify-center items-center border border-solid border-indigo-600 !w-12 !h-12 transition-all duration-500 rounded-full hover:bg-indigo-600 !-translate-x-16" data-carousel-prev>
                <svg className="h-5 w-5 text-indigo-600 group-hover:text-white" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10.0002 11.9999L6 7.99971L10.0025 3.99719" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="swiper-button-next group !p-2 flex justify-center items-center border border-solid border-indigo-600 !w-12 !h-12 transition-all duration-500 rounded-full hover:bg-indigo-600 !translate-x-16" data-carousel-next>
                <svg className="h-5 w-5 text-indigo-600 group-hover:text-white" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M5.99984 4.00012L10 8.00029L5.99748 12.0028" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Get your orders delivered quickly and safely</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">All products are quality tested and guaranteed</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Our customer support team is always here to help</p>
            </div>
          </div>
        </div>
      </section>



      {/* Call to Action */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of satisfied customers and discover amazing products today
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home 