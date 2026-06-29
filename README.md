# CommerceKit Pro - Production-Ready Full-Stack E-Commerce (Firebase + React)

A full-stack e-commerce web application built with a JavaScript stack:

- Frontend: React + Vite + Tailwind CSS
- Backend services: Firebase Authentication + Firestore
- State management: Context API
- Database: Firestore
- Deployment-ready setup with environment variables and Firestore security rules

This implementation includes the complete Tier-1 feature set requested: auth + RBAC, product catalog, cart and checkout workflow, search/filter/sort, and order management with admin status updates.

## 1) Project Folder Structure

```text
.
|-- .env.example
|-- firestore.rules
|-- firestore.indexes.json
|-- docs/
|   |-- database-schema.md
|   `-- implementation-plan.md
|-- src/
|   |-- App.jsx
|   |-- main.jsx
|   |-- firebase.js
|   |-- index.css
|   |-- hooks/
|   |   `-- useDebouncedValue.js
|   |-- utils/
|   |   `-- formatCurrency.js
|   |-- context/
|   |   |-- authContext.jsx
|   |   `-- cartContext.jsx
|   |-- services/
|   |   |-- productService.js
|   |   |-- cartService.js
|   |   `-- orderService.js
|   |-- components/
|   |   |-- layout/
|   |   |   |-- AppLayout.jsx
|   |   |   |-- AppHeader.jsx
|   |   |   `-- AppFooter.jsx
|   |   |-- routes/
|   |   |   |-- ProtectedRoute.jsx
|   |   |   `-- RoleGuard.jsx
|   |   |-- ui/
|   |   |   |-- PageLoader.jsx
|   |   |   |-- SkeletonCard.jsx
|   |   |   `-- EmptyState.jsx
|   |   |-- products/
|   |   |   |-- ProductCard.jsx
|   |   |   `-- ProductFilters.jsx
|   |   `-- orders/
|   |       `-- OrderStatusBadge.jsx
|   `-- pages/
|       |-- HomePage.jsx
|       |-- ProductDetailsPage.jsx
|       |-- AuthPage.jsx
|       |-- CartPage.jsx
|       |-- CheckoutPage.jsx
|       |-- OrdersPage.jsx
|       |-- OrderDetailsPage.jsx
|       |-- AdminOrdersPage.jsx
|       `-- ForbiddenPage.jsx
`-- package.json
```

## 2) Database Schema / Models

Schema is documented in detail at `docs/database-schema.md`.

### products collection

- name
- description
- price
- discountPrice
- category
- subcategory
- images
- stockQuantity
- rating
- reviewsCount
- variants: colors/sizes
- createdAt
- updatedAt

### users collection

- uid
- email
- displayName
- role (`user` | `admin`)
- createdAt
- updatedAt

### users/{uid}/cartItems subcollection

- productId
- name
- image
- price
- discountPrice
- color
- size
- quantity
- stockQuantity
- updatedAt

### orders collection

- uid
- email
- items[]
- shipping object
- totals object
- status (`Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`)
- createdAt
- updatedAt

## 3) API Routes or Firebase Service Functions

Firebase service layer is implemented in `src/services/`.

### Product service (`src/services/productService.js`)

- `listProducts({ search, filters, sortBy })`
- `getProductById(productId)`

Supports:

- search by name
- filter by category
- filter by price range
- filter by minimum rating
- sort by newest, price low-high, price high-low, highest rated

### Cart service (`src/services/cartService.js`)

- `fetchUserCart(uid)`
- `addItemToUserCart(uid, payload)`
- `updateUserCartQuantity(uid, itemId, quantity)`
- `removeItemFromUserCart(uid, itemId)`
- `clearUserCart(uid, itemIds)`

### Order service (`src/services/orderService.js`)

- `placeOrder({ uid, email, items, shipping, totals })`
- `listOrdersByUser(uid)`
- `listOrders()` (admin)
- `getOrderById(orderId)`
- `updateOrderStatus({ orderId, status })` (admin)

## 4) Frontend Pages / Components

### Authentication & Authorization

- Email/password signup and login (`src/pages/AuthPage.jsx`)
- Google OAuth (`src/context/authContext.jsx`)
- Session persistence via Firebase local persistence
- RBAC with `user` and `admin` role (`src/components/routes/RoleGuard.jsx`)
- Protected routes (`src/components/routes/ProtectedRoute.jsx`)

### Product Catalog

- Product listing page: `src/pages/HomePage.jsx`
- Product details page: `src/pages/ProductDetailsPage.jsx`
- Responsive product cards: `src/components/Products/ProductCard.jsx`
- Category/price/rating filters + sort controls: `src/components/Products/ProductFilters.jsx`
- Debounced search: `src/hooks/useDebouncedValue.js`

### Cart & Checkout

- Add/remove/update quantity: `src/context/cartContext.jsx`
- Persistent cart for logged-in users in Firestore (`users/{uid}/cartItems`)
- Guest cart fallback in localStorage
- Totals calculation: subtotal + tax + shipping + grand total
- Cart page: `src/pages/CartPage.jsx`
- Checkout page + order summary before placing order: `src/pages/CheckoutPage.jsx`

### Order Management

- Place order to Firestore: `src/services/orderService.js`
- User order history page: `src/pages/OrdersPage.jsx`
- User order details page: `src/pages/OrderDetailsPage.jsx`
- Admin order management page: `src/pages/AdminOrdersPage.jsx`
- Order statuses: pending/confirmed/shipped/delivered/cancelled

### Non-functional

- Fully responsive Tailwind layout
- Reusable modular components
- Loading states (`PageLoader`, `SkeletonCard`)
- Empty states (`EmptyState`)
- Toast notifications (`react-hot-toast`)
- Secure Firestore rules (`firestore.rules`)
- Lazy loading / code splitting (`React.lazy` + `Suspense`)

## 5) Step-by-Step Implementation Plan

Detailed checklist is available at `docs/implementation-plan.md`.

High-level sequence:

1. Setup frontend base (Vite + Router + Tailwind).
2. Configure Firebase + env variables.
3. Implement auth + RBAC + route protection.
4. Build product schema + listing + detail pages.
5. Implement persistent cart and totals.
6. Implement checkout and order placement.
7. Implement user/admin order management.
8. Add loading, validation, toasts, and error handling.
9. Apply Firestore rules/indexes and deploy.

## Run Locally

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase project with Authentication + Firestore enabled

### Setup

1. Copy environment template:

```bash
cp .env.example .env
```

2. Fill Firebase values in `.env`.

3. Install dependencies:

```bash
npm install
```

4. Start development server:

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Security and Deployment Notes

- Firestore rules are defined in `firestore.rules`.
- Required composite indexes are in `firestore.indexes.json`.
- Do not commit real secret values in source.
- Deploy frontend to Vercel/Netlify/Firebase Hosting.
- Deploy Firestore rules and indexes via Firebase CLI.

## Current Extension Points

- Cloud Functions for payment webhooks and server-side checkout validation
- Product review module with write throttling and moderation
- Pagination/infinite scroll for large catalogs
- Unit tests and integration tests for service layer and route guards
