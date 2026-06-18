# VenusShopze - Savana-Style Indian E-Commerce Application

A premium, full-stack MERN (MongoDB, Express.js, React, Node.js) e-commerce application designed with a colorful, trendy, high-fashion vibe (Savana-style) adapted for modern electronics.

🚀 **Live Production Link**: [VenusShopze](https://shopez-lovat.vercel.app)

## ✨ Tech Stack & Core Features

* **Backend**: Node.js & Express.js server, Mongoose (MongoDB ODM), JWT authentication, `bcryptjs` encryption.
* **Frontend**: React.js scaffolded with Vite, React Router DOM (client routing), Axios (API client), Lucide React (vector iconography).
* **Styling**: Curated custom Vanilla CSS (custom colors, micro-animations, glassmorphism, responsive grids).
* **Authentications**: Roles: `User` / `Seller` / `Admin` with secure state persistence (token refresh on mount).
* **Product Search**: Strict exact keyword matching logic on titles and descriptions.
* **Shopping Basket**: Persistent shopping cart syncing local guest additions with database cart collections upon authentication.
* **Dashboards**:
  * **Seller Dashboard**: Earnings analytics, listed inventory manager (CRUD), order fulfilment status updates.
  * **Admin Panel**: Registered users directory with role editing (make seller/admin), transaction logs, system-wide status overview.

---

## 📂 Project Structure

```text
/venushopze
├── /backend
│   ├── /models               # Mongoose DB Schemas (User, Product, Order, Cart, Review)
│   ├── /routes               # Express Routers (auth, products, cart, orders, analytics)
│   ├── /middlewares          # Auth verification and roles checks
│   ├── server.js             # Root server execution entry point
│   ├── seed.js               # Database population script (electronics & test users)
│   └── package.json
├── /frontend
│   ├── /src
│   │   ├── /components       # Navbar, Footer, ProtectedRoutes wrappers
│   │   ├── /context          # AuthContext and CartContext integrations
│   │   ├── /pages            # Home, Catalog, Details, Cart, Checkout, Confirm, Dashboards
│   │   ├── App.jsx           # Routing declarations
│   │   ├── main.jsx          # App bootstrap
│   │   └── index.css         # Global stylesheets containing Savana design system
│   ├── package.json
│   └── vite.config.js
├── .env.example              # Root template for server environment variables
└── README.md                 # Setup instructions
```

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16.x or higher)
* [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port `27017` (or access to a MongoDB Atlas cluster)

### 2. Configure Environment Variables
1. Navigate to `/backend`.
2. Copy the `.env.example` file to create a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update `MONGODB_URI` with your connection string if you are not using default local settings.

### 3. Database Seeding
To populate the database with test users and our curated electronic products:
1. Start your local MongoDB service.
2. Navigate to the `/backend` folder.
3. Run the seeding script:
   ```bash
   npm run seed
   ```

### 4. Running the Application
Open two separate terminal windows:

#### Terminal 1: Backend Server
```bash
cd backend
npm start
```
*The server will start running on port `5001`.*

#### Terminal 2: Frontend Client
```bash
cd frontend
npm install
npm run dev
```
*The React app will boot up on a local address, e.g. `http://localhost:5173`.*

---

## 🔑 Test Credentials & Role Access

You can log in immediately using the accounts created during the database seeding:

### 👤 Buyer User Account
* **Email**: `user@venus.com`
* **Password**: `userpassword123`
* **Access**: Browse catalog, write reviews, add items, checkout (COD/Card).

### 🏷️ Seller Account
* **Email**: `seller@venus.com`
* **Password**: `sellerpassword123`
* **Access**: View seller earnings analytics, add/edit/delete electronic listings, update transit status (Processing/Shipped/Delivered).

### 🛡️ Admin Account
* **Email**: `admin@venus.com`
* **Password**: `adminpassword123`
* **Access**: Demote/promote user accounts, delete users, view total transactions, check system metrics.

---

## ☁️ Vercel Deployment & Seeding

This project is configured as a MERN monorepo for direct deployment on Vercel:

### 1. Serverless Architecture
- The React/Vite frontend builds via `@vercel/static-build` and serves static files directly.
- The Node/Express backend compiles via `@vercel/node` and runs serverless functions under the `/api` route.
- Path mappings and fallbacks for client-side routing are managed via [vercel.json](file:///Users/sathwikadigoppula/venushopze/vercel.json).

### 2. Environment Variables Configuration
To set up a similar deployment, configure the following Environment Variables in your Vercel Dashboard project settings:
- `MONGO_URI`: Your MongoDB Atlas connection string (e.g. `mongodb+srv://<user>:<password>@cluster.mongodb.net/venushopze?retryWrites=true&w=majority`).
- `JWT_SECRET`: A secure signing key for JSON Web Tokens.

### 3. Remote Database Setup & Seeding
To populate a fresh remote database on Vercel:
1. Ensure your MongoDB Atlas cluster allows incoming connections from anywhere (add `0.0.0.0/0` in MongoDB Atlas Network Security settings).
2. Visit the following seeding endpoint in your browser or trigger it via curl:
   ```bash
   curl https://shopez-lovat.vercel.app/api/products/seed
   ```
This will automatically reset collections and seed the correct products catalog and test accounts into your remote database instance.
