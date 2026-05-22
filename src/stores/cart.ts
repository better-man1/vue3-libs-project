import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Product {
  id: number
  name: string
  price: number
  category: string
  image: string
  stock: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const products = ref<Product[]>([
    { id: 1, name: 'Premium Wireless Headphones', price: 999, category: 'Electronics', image: '🎧', stock: 10 },
    { id: 2, name: 'Mechanical Gaming Keyboard', price: 599, category: 'Electronics', image: '⌨️', stock: 5 },
    { id: 3, name: 'Ergonomic Office Chair', price: 1299, category: 'Furniture', image: '🪑', stock: 3 },
    { id: 4, name: 'Smart Fitness Watch', price: 799, category: 'Electronics', image: '⌚', stock: 15 },
    { id: 5, name: 'Stainless Steel Water Bottle', price: 129, category: 'Lifestyle', image: '🧴', stock: 25 },
  ])

  const cartItems = ref<CartItem[]>([])

  const totalItemsCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.product.price * item.quantity, 0)
  })

  const addToCart = (product: Product) => {
    const existingItem = cartItems.value.find(item => item.product.id === product.id)
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++
      }
    } else {
      cartItems.value.push({ product, quantity: 1 })
    }
  }

  const removeFromCart = (productId: number) => {
    cartItems.value = cartItems.value.filter(item => item.product.id !== productId)
  }

  const updateQuantity = (productId: number, quantity: number) => {
    const item = cartItems.value.find(i => i.product.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else if (quantity <= item.product.stock) {
        item.quantity = quantity
      }
    }
  }

  const checkout = () => {
    // Deduct stock
    cartItems.value.forEach(item => {
      const p = products.value.find(p => p.id === item.product.id)
      if (p) {
        p.stock -= item.quantity
      }
    })
    cartItems.value = []
  }

  return {
    products,
    cartItems,
    totalItemsCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    checkout,
  }
})
