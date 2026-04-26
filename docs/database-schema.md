# Firestore Database Schema

## Collections

## users/{uid}

- uid: string
- email: string
- displayName: string
- role: "user" | "admin"
- createdAt: timestamp
- updatedAt: timestamp

## users/{uid}/cartItems/{itemId}

- productId: string
- name: string
- image: string
- price: number
- discountPrice: number | null
- color: string
- size: string
- quantity: number
- stockQuantity: number
- updatedAt: string (ISO)

## products/{productId}

- name: string
- description: string
- price: number
- discountPrice: number | null
- category: string
- subcategory: string
- images: string[]
- stockQuantity: number
- rating: number
- reviewsCount: number
- variants: {
  - colors: string[]
  - sizes: string[]
}
- createdAt: timestamp
- updatedAt: timestamp

## orders/{orderId}

- uid: string
- email: string
- items: Array<{
  - productId: string
  - name: string
  - image: string
  - price: number
  - discountPrice: number | null
  - color: string
  - size: string
  - quantity: number
  - stockQuantity: number
}>
- shipping: {
  - fullName: string
  - phone: string
  - addressLine1: string
  - addressLine2: string
  - city: string
  - state: string
  - postalCode: string
  - country: string
}
- totals: {
  - subtotal: number
  - tax: number
  - shipping: number
  - grandTotal: number
}
- status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled"
- createdAt: timestamp
- updatedAt: timestamp
