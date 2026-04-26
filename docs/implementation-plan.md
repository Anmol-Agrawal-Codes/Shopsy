# Step-by-Step Implementation Plan

1. Initialize frontend foundation
- Configure Vite + React + Tailwind CSS.
- Add React Router and route-level code splitting.

2. Configure Firebase
- Set env variables.
- Initialize Firebase app, auth, and Firestore.
- Add Firestore security rules and indexes.

3. Implement authentication + RBAC
- Build AuthProvider with session persistence.
- Support email/password + Google OAuth login.
- Store profile with role in users collection.
- Add ProtectedRoute and RoleGuard.

4. Implement product catalog
- Define scalable product schema in Firestore.
- Build product listing and detail pages.
- Add search (debounced), filters, and sorting.

5. Implement persistent cart
- Build CartProvider.
- Persist logged-in cart under users/{uid}/cartItems.
- Add add/remove/update quantity APIs.
- Add subtotal, tax, shipping, and grand total calculations.

6. Implement checkout + orders
- Build checkout page with shipping form.
- Place order to orders collection.
- Decrement stock with batch updates.
- Clear cart after successful order placement.

7. Build order management
- User: order history and order details pages.
- Admin: manage all orders and update status.

8. Harden UX and quality
- Add skeleton loaders and empty states.
- Add toast notifications and error handling.
- Validate forms and edge cases.

9. Deploy
- Configure hosting target (Vercel/Netlify/Firebase Hosting).
- Set production env variables.
- Deploy Firestore rules and indexes.
- Run build verification in CI.
