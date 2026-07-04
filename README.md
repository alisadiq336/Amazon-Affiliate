# Amazon Affiliate E-Commerce Store

A premium, modern Amazon Affiliate E-Commerce Store with an Administrator Dashboard. Customers can browse products, search, filter, view detailed product pages, and click "Buy Now" which redirects them to Amazon via affiliate links. The admin dashboard allows managing categories, adding products with image uploads (using Multer and Cloudinary with local storage fallback), and configuring affiliate links.

## Project Structure
- `client/`: React + Vite frontend styled with custom Vanilla CSS (Slate/Gold theme).
- `server/`: Node.js, Express, MongoDB/Mongoose, JWT, express-validator, Multer, and Cloudinary.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally or a MongoDB Atlas URI

### Server Installation
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file inside `server/`:
   - Provide your `MONGODB_URI` (default is `mongodb://localhost:27017/amazon_affiliate`).
   - Customize `JWT_SECRET`.
   - Setup Cloudinary credentials (optional; if omitted, the application will fallback to saving uploaded images locally in `server/uploads/`).
4. Start the server:
   - Development mode: `npm run dev`
   - Production mode: `npm start`

> **Note**: On the first start, the server will automatically seed a default admin account and several affiliate products if the database is empty:
> - **Admin Email**: `admin@amazonstore.com`
> - **Admin Password**: `adminpassword123`

### Client Installation
1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client:
   ```bash
   npm run dev
   ```
