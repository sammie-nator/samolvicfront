import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'

// ============================================================================
// PAGE IMPORTS
// ============================================================================

// Main Pages
import Home from './pages/Home'
import Shop from './pages/Shop'

// Payment Pages
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailure from './pages/PaymentFailure'
import PaystackReturn from './pages/PaystackReturn'

// ============================================================================
// COMPONENT IMPORTS
// ============================================================================

import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  // ========== CART STATE ==========
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)

  // ========== SAMPLE PRODUCTS DATA ==========
  const [products] = useState([
    {
      id: 1,
      name: 'Tomatoes',
      image: '🍅',
      price: 70,
      unit: '1kg',
      category: 'vegetables',
    },
    {
      id: 2,
      name: 'Kale',
      image: '🥬',
      price: 50,
      unit: 'bunch',
      category: 'vegetables',
    },
    {
      id: 3,
      name: 'Carrots',
      image: '🥕',
      price: 40,
      unit: '500g',
      category: 'vegetables',
    },
    {
      id: 4,
      name: 'Apples',
      image: '🍎',
      price: 100,
      unit: '1kg',
      category: 'fruits',
    },
    {
      id: 5,
      name: 'Bananas',
      image: '🍌',
      price: 60,
      unit: 'bunch',
      category: 'fruits',
    },
    {
      id: 6,
      name: 'Oranges',
      image: '🍊',
      price: 80,
      unit: '1kg',
      category: 'fruits',
    },
    {
      id: 7,
      name: 'Onions',
      image: '🧅',
      price: 30,
      unit: '500g',
      category: 'vegetables',
    },
    {
      id: 8,
      name: 'Potatoes',
      image: '🥔',
      price: 45,
      unit: '1kg',
      category: 'vegetables',
    },
  ])

  // ========== ORDER STATE ==========
  const [orderStatus, setOrderStatus] = useState(null)

  // ========== LOAD CART FROM LOCALSTORAGE ==========
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
  }, [])

  // ========== SAVE CART TO LOCALSTORAGE ==========
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // ============================================================================
  // CART FUNCTIONS
  // ============================================================================

  const addToCart = (product) => {
    console.log('Adding to cart:', product.name)

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        // Item exists, increase quantity
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      } else {
        // New item, add to cart
        return [...prevCart, { ...product, qty: 1 }]
      }
    })
  }

  // Note: removeFromCart is commented out but available if needed
  // const removeFromCart = (productId) => {
  //   console.log('Removing from cart:', productId)
  //   setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  // }

  const updateQty = (productId, change) => {
    console.log(`Updating qty for ${productId} by ${change}`)

    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId
            ? { ...item, qty: Math.max(0, item.qty + change) }
            : item
        )
        .filter((item) => item.qty > 0)
    )
  }

  const clearCart = () => {
    console.log('Clearing cart')
    setCart([])
  }

  // ============================================================================
  // ORDER FUNCTIONS
  // ============================================================================

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }

    setOrderStatus('sending')

    try {
      // TODO: Integrate with WhatsApp Business API or similar
      console.log('Placing order via WhatsApp')
      console.log('Cart items:', cart)
      console.log('Total:', cartTotal)

      // For now, just simulate the order
      alert('Order placed! We will contact you soon on WhatsApp.')

      // Clear cart after successful order
      clearCart()
      setCartOpen(false)
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order. Please try again.')
    } finally {
      setOrderStatus(null)
    }
  }

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* HEADER */}
        <Header
          cartCount={cartCount}
          onCartClick={() => setCartOpen(true)}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <Routes>
            {/* ============= MAIN PAGES ============= */}
            <Route
              path="/"
              element={
                <Home
                  onAddToCart={addToCart}
                  onCartClick={() => setCartOpen(true)}
                />
              }
            />

            <Route
              path="/shop"
              element={
                <Shop
                  products={products}
                  cart={cart}
                  onAddToCart={addToCart}
                  onCartClick={() => setCartOpen(true)}
                />
              }
            />

            {/* ============= PAYMENT PAGES ============= */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/paystack-return" element={<PaystackReturn />} />

            {/* ============= 404 PAGE ============= */}
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                      404
                    </h1>
                    <p className="text-gray-600 mb-8">
                      Page not found
                    </p>
                    <a
                      href="/"
                      className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
                    >
                      Back to Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        {/* FOOTER */}
        <Footer />

        {/* CART DRAWER */}
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cart={cart}
          cartCount={cartCount}
          cartTotal={cartTotal}
          updateQty={updateQty}
          placeOrder={placeOrder}
          orderStatus={orderStatus}
        />
      </div>
    </Router>
  )
}

export default App
