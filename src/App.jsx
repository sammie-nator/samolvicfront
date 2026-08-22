import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Products from './components/Products'
import WhyUs from './components/WhyUs'
import Contact from './components/Contact'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import { WHATSAPP_NUMBER } from './constants'
import './index.css';

function App() {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [orderStatus, setOrderStatus] = useState(null)

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
    setCartOpen(true)
  }

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
        )
        .filter((item) => item.qty > 0)
    )
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  const placeOrder = () => {
    if (cart.length === 0) return
    const name = prompt('Your full name:')
    const phone = prompt('Your phone number (for WhatsApp confirmation):')
    if (!name || !phone) return

    setOrderStatus('sending')
    const summary = cart
      .map((i) => `${i.qty}x ${i.name} (KES ${i.price})`)
      .join('%0A')
    const msg = `Hello Samolvic Technologies!%0A%0AI would like to order:%0A${summary}%0A%0ATotal: KES ${cartTotal}%0A%0AName: ${name}%0APhone: ${phone}`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
    setOrderStatus('success')

    setTimeout(() => {
      setCart([])
      setOrderStatus(null)
    }, 2500)
  }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        scrollTo={scrollTo}
      />

      <Hero scrollTo={scrollTo} />

      <Products onAddToCart={addToCart} />

      <WhyUs />

      <Contact />

      <Footer />

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

      <FloatingWhatsApp />
    </div>
  )
}

export default App
