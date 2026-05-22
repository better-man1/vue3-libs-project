<template>
  <div class="pinia-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Pinia 状态管理</el-breadcrumb-item>
      <el-breadcrumb-item>购物车系统</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>Pinia 购物车系统</h2>
      <p>复杂共享状态设计，模拟真实的商品列表、添加购物车、修改库存以及订单结算过程。展示了跨组件及多层数据的 Action 调用。</p>
    </div>

    <el-row :gutter="20">
      <!-- Catalog Grid -->
      <el-col :xs="24" :lg="14">
        <DemoCard 
          title="商品展示中心" 
          description="点击商品加入购物车，实时扣减可用库存数量"
          :code="cartCode"
        >
          <div class="product-grid">
            <el-row :gutter="16">
              <el-col :xs="24" :sm="12" v-for="product in cartStore.products" :key="product.id" class="mb-3">
                <div class="product-item-card">
                  <div class="prod-img">{{ product.image }}</div>
                  <div class="prod-info">
                    <span class="prod-category">{{ product.category }}</span>
                    <h4 class="prod-name">{{ product.name }}</h4>
                    <div class="prod-meta">
                      <span class="prod-price">¥{{ product.price }}</span>
                      <span class="prod-stock" :class="{ 'low-stock': product.stock <= 3 }">
                        库存: {{ product.stock }}
                      </span>
                    </div>
                    <el-button 
                      type="primary" 
                      size="small" 
                      :disabled="product.stock <= 0"
                      @click="cartStore.addToCart(product)"
                      class="add-btn"
                    >
                      {{ product.stock > 0 ? '加入购物车' : '已售罄' }}
                    </el-button>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </DemoCard>
      </el-col>

      <!-- Cart list & Stats -->
      <el-col :xs="24" :lg="10">
        <el-card shadow="hover" class="cart-side-card">
          <template #header>
            <div class="cart-header">
              <span>🛒 我的购物车</span>
              <el-badge :value="cartStore.totalItemsCount" class="item-badge" type="danger" />
            </div>
          </template>

          <div class="cart-content">
            <el-empty 
              v-if="cartStore.cartItems.length === 0" 
              description="购物车空空如也，快去选购吧！" 
              :image-size="70"
            />
            
            <div v-else class="cart-items-list">
              <div v-for="item in cartStore.cartItems" :key="item.product.id" class="cart-item">
                <span class="cart-emoji">{{ item.product.image }}</span>
                <div class="cart-item-info">
                  <h5>{{ item.product.name }}</h5>
                  <div class="cart-item-price">¥{{ item.product.price }}</div>
                </div>
                <div class="cart-item-controls">
                  <el-input-number 
                    :model-value="item.quantity"
                    :min="0"
                    :max="item.product.stock"
                    size="small"
                    @change="(val: number | undefined) => handleQuantityChange(item.product.id, val || 0)"
                    controls-position="right"
                  />
                  <el-button 
                    type="danger" 
                    link 
                    size="small"
                    @click="cartStore.removeFromCart(item.product.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>

              <div class="cart-summary">
                <div class="summary-line">
                  <span>总计商品:</span>
                  <strong>{{ cartStore.totalItemsCount }} 件</strong>
                </div>
                <div class="summary-line">
                  <span>应付总额:</span>
                  <strong class="total-price-text">¥{{ cartStore.totalPrice }}</strong>
                </div>
                
                <el-button 
                  type="success" 
                  class="checkout-btn" 
                  @click="handleCheckout"
                >
                  立即结算 & 扣减库存
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { ElMessage, ElMessageBox } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

const cartStore = useCartStore()

const handleQuantityChange = (productId: number, val: number) => {
  cartStore.updateQuantity(productId, val)
}

const handleCheckout = () => {
  ElMessageBox.confirm(
    `您确认支付 ¥${cartStore.totalPrice} 元并完成结算吗？这将会扣减对应商品库存。`,
    '确认结算',
    {
      confirmButtonText: '确定支付',
      cancelButtonText: '取消',
      type: 'success',
    }
  )
    .then(() => {
      cartStore.checkout()
      ElMessage({
        type: 'success',
        message: '结算成功！已更新库存商品状态。',
      })
    })
    .catch(() => {})
}

const cartCode = `// stores/cart.ts
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
    //... 其它商品数据
  ])
  const cartItems = ref<CartItem[]>([])

  // Getters
  const totalItemsCount = computed(() => cartItems.value.reduce((t, i) => t + i.quantity, 0))
  const totalPrice = computed(() => cartItems.value.reduce((t, i) => t + (i.product.price * i.quantity), 0))

  // Actions
  const addToCart = (product: Product) => {
    const existing = cartItems.value.find(item => item.product.id === product.id)
    if (existing) {
      if (existing.quantity < product.stock) existing.quantity++
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
      if (quantity <= 0) removeFromCart(productId)
      else if (quantity <= item.product.stock) item.quantity = quantity
    }
  }

  const checkout = () => {
    cartItems.value.forEach(item => {
      const p = products.value.find(p => p.id === item.product.id)
      if (p) p.stock -= item.quantity
    })
    cartItems.value = []
  }

  return { products, cartItems, totalItemsCount, totalPrice, addToCart, removeFromCart, updateQuantity, checkout }
})`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.pinia-demo-container {
  padding-bottom: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-3 {
  margin-bottom: 16px;
}

.header-desc {
  margin-bottom: 24px;
  h2 {
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 6px;
  }
  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
}

.product-item-card {
  display: flex;
  background-color: var(--bg-color-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 16px;
  gap: 16px;
  height: 100%;
  transition: all 0.2s;
  
  &:hover {
    border-color: $primary-light;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  }

  .prod-img {
    font-size: 2.2rem;
    background-color: var(--bg-color-secondary);
    width: 64px;
    height: 64px;
    border-radius: 8px;
    @include flex-center;
    flex-shrink: 0;
  }

  .prod-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .prod-category {
      font-size: 0.75rem;
      color: $primary-color;
      font-weight: 600;
      text-transform: uppercase;
    }

    .prod-name {
      margin: 4px 0 8px 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.3;
    }

    .prod-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .prod-price {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .prod-stock {
        font-size: 0.8rem;
        color: var(--text-secondary);
        
        &.low-stock {
          color: $secondary-color;
          font-weight: 500;
        }
      }
    }
  }
}

.cart-side-card {
  height: 100%;
  
  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .cart-items-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .cart-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);

    .cart-emoji {
      font-size: 1.5rem;
    }

    .cart-item-info {
      flex: 1;
      
      h5 {
        margin: 0 0 4px 0;
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      
      .cart-item-price {
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-weight: 500;
      }
    }

    .cart-item-controls {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      
      .el-input-number {
        width: 90px;
      }
    }
  }

  .cart-summary {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
      color: var(--text-secondary);
      
      .total-price-text {
        font-size: 1.3rem;
        color: $secondary-color;
      }
    }

    .checkout-btn {
      width: 100%;
      height: 40px;
      margin-top: 8px;
      font-weight: 600;
    }
  }
}
</style>
