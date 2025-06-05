// types/cart.d.ts or types/cart.ts (create this file if it doesn't exist)
export interface CartItem {
  id: string; // Unique identifier for the item
  name: string; // Name of the product (e.g., "RTX 4090")
  price: number; // Price of a single item (e.g., 1599.99 for $1599.99). This should be in your base currency unit (dollars, euros, etc.)
  quantity: number; // Number of this item in the cart
  image: string; // URL to the product image
  manufacturer: string; // (e.g., "NVIDIA")
  memory: string; // (e.g., "24GB GDDR6X")
  stock: number; // Current stock level
}
