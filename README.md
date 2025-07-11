# E-Commerce MERN Stack Application

A full-stack e-commerce website built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring user authentication, admin dashboard, product management, and shopping cart functionality.

## Features

### Public Features
- **Landing Page**: Beautiful hero section with featured products
- **Product Catalog**: Browse all products with filtering and search
- **Product Details**: Detailed product information with images and specifications
- **Responsive Design**: Mobile-first design using Tailwind CSS

### User Features (Requires Authentication)
- **User Registration & Login**: Secure authentication with JWT
- **Shopping Cart**: Add/remove items, update quantities
- **Wishlist**: Save products for later
- **Order Management**: View order history and track orders
- **User Profile**: Update personal information

### Admin Features
- **Admin Dashboard**: Overview with statistics and quick actions
- **Product Management**: CRUD operations for products
- **Category Management**: Manage product categories
- **Brand Management**: Manage product brands
- **User Management**: View and manage user accounts
- **Order Management**: Process and track orders
- **Admin Profile**: Manage admin account

## Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **cors**: Cross-origin resource sharing

### Frontend
- **React.js**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Icon library
- **React Hot Toast**: Toast notifications
- **Axios**: HTTP client

## Project Structure

```
e-commerce/
├── backend/                 # Backend API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── config.env         # Environment variables
│   ├── package.json       # Backend dependencies
│   └── server.js          # Server entry point
├── frontend/               # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # App entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
├── package.json           # Root package.json
└── README.md             # Project documentation
```

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-commerce
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```bash
   cd backend
   cp config.env .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   ```

4. **Database Setup**
   
   Make sure MongoDB is running on your system, or update the `MONGODB_URI` to point to your MongoDB Atlas cluster.

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Or run both simultaneously**
   ```bash
   # From the root directory
   npm run dev
   ```

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the production server**
   ```bash
   cd backend
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get product by ID (public)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - Get all categories (public)
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Brands
- `GET /api/brands` - Get all brands (public)
- `POST /api/brands` - Create brand (admin only)
- `PUT /api/brands/:id` - Update brand (admin only)
- `DELETE /api/brands/:id` - Delete brand (admin only)

### Orders
- `GET /api/orders` - Get orders (user/admin)
- `GET /api/orders/:id` - Get order by ID (user/admin)
- `POST /api/orders` - Create order (user)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Cart
- `GET /api/cart` - Get user cart (user)
- `POST /api/cart/add` - Add item to cart (user)
- `PUT /api/cart/update` - Update cart item (user)
- `DELETE /api/cart/remove/:productId` - Remove item from cart (user)
- `DELETE /api/cart/clear` - Clear cart (user)

### Wishlist
- `GET /api/wishlist` - Get user wishlist (user)
- `POST /api/wishlist/add` - Add item to wishlist (user)
- `DELETE /api/wishlist/remove/:productId` - Remove item from wishlist (user)
- `DELETE /api/wishlist/clear` - Clear wishlist (user)

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Admin Access

To create an admin user, you can either:

1. **Manually update the database**:
   ```javascript
   // In MongoDB shell or MongoDB Compass
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Create a seed script** to add an admin user during development.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

## Acknowledgments

- React.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the database
- All the open-source contributors whose packages made this project possible 