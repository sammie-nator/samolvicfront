import { useState } from 'react'
import { FiShoppingCart } from 'react-icons/fi'

import { categories, products } from '../data/products'

// Must match CartDrawer / deployed backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000'

export default function Products({ onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const [phone, setPhone] = useState('')
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [paying, setPaying] = useState(false)
  const [payStatus, setPayStatus] = useState(null)
  const [payMessage, setPayMessage] = useState('')

  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory)

  const openMpesaModal = (product) => {
    setSelectedProduct(product)
    setPhone('')
    setPayStatus(null)
    setPayMessage('')
    setPaying(false)
    setShowPayModal(true)
  }

  const handleMpesaPay = async () => {
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      setPayStatus('error')
      setPayMessage('Please enter a valid M-Pesa phone number')
      return
    }
    if (!selectedProduct) return

    setPaying(true)
    setPayStatus(null)
    setPayMessage('')

    // Same format your backend already logged as COMPLETED
    const orderNumber = `Samolvic-${selectedProduct.id}-${Date.now()}`
    const amount = selectedProduct.price

    const goSuccess = () => {
      window.location.assign(
        `/payment/success?orderNumber=${encodeURIComponent(orderNumber)}&amount=${amount}&method=M-Pesa`
      )
    }

    const goFailure = (reason) => {
      const msg = reason || 'Payment failed'
      const code = /cancel/i.test(msg)
        ? 'CANCELLED'
        : /timeout|timed out/i.test(msg)
          ? 'TIMEOUT'
          : /insufficient/i.test(msg)
            ? 'INSUFFICIENT_FUNDS'
            : 'TRANSACTION_DECLINED'
      window.location.assign(
        `/payment/failure?orderNumber=${encodeURIComponent(orderNumber)}&amount=${amount}&method=M-Pesa&errorCode=${code}&errorMessage=${encodeURIComponent(msg)}`
      )
    }

    try {
      const res = await fetch(`${API_URL}/api/mpesa/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          amount,
          accountReference: orderNumber,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.success) {
        setPayStatus('error')
        setPayMessage(
          data.error?.errorMessage ||
            data.error?.message ||
            (typeof data.error === 'string' ? data.error : null) ||
            'Payment failed. Try again.'
        )
        setPaying(false)
        return
      }

      // Prefer orderNumber returned by backend (source of truth for status key)
      const confirmedOrder =
        data.data?.orderNumber || data.orderNumber || orderNumber

      setPayStatus('pending')
      setPayMessage(
        'STK sent. Enter your M-Pesa PIN on your phone. Waiting for confirmation…'
      )

      const maxAttempts = 45
      let attempts = 0

      const poll = async () => {
        attempts += 1
        try {
          const statusRes = await fetch(
            `${API_URL}/api/mpesa/status/${encodeURIComponent(confirmedOrder)}`,
            { cache: 'no-store' }
          )
          const statusData = await statusRes.json().catch(() => ({}))
          console.log(`M-Pesa poll #${attempts}:`, statusData)

          if (statusRes.ok && statusData.status === 'COMPLETED') {
            setPayStatus('success')
            setPayMessage('Payment confirmed! Redirecting…')
            setPaying(false)
            goSuccess()
            return
          }

          if (statusRes.ok && statusData.status === 'FAILED') {
            setPayStatus('error')
            setPayMessage(statusData.failureReason || 'Payment failed')
            setPaying(false)
            goFailure(statusData.failureReason || 'Payment failed or cancelled')
            return
          }
        } catch (pollErr) {
          console.warn('Status poll error:', pollErr)
        }

        if (attempts >= maxAttempts) {
          setPaying(false)
          goFailure(
            `Timed out waiting for confirmation. Order ${confirmedOrder}. If money was deducted, contact support.`
          )
          return
        }

        setTimeout(poll, 3000)
      }

      setTimeout(poll, 3000)
    } catch (err) {
      console.error(err)
      setPayStatus('error')
      setPayMessage('Could not reach payment server. Please try again later.')
      setPaying(false)
    }
  }

  return (
    <section id="products" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="section-title">Our Products</h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Carefully selected cereals, pulses and essentials for your home and
            business.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-charcoal-900 text-white shadow-md'
                  : 'bg-white text-gray-600 shadow-sm hover:bg-gold-50 hover:text-gold-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="card group relative overflow-hidden"
            >
              {product.popular && (
                <span className="absolute right-4 top-4 rounded-full bg-gold-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                  Popular
                </span>
              )}
              <div className="flex h-28 items-center justify-center text-6xl transition group-hover:scale-110">
                {product.image}
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gold-600">
                  {product.category}
                </p>
                <h3 className="mt-1 font-semibold text-charcoal-900">
                  {product.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                  {product.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-charcoal-900">
                      KES {product.price}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">
                      / {product.unit}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openMpesaModal(product)}
                    className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Buy with M-Pesa
                  </button>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="rounded-lg bg-charcoal-900 p-2.5 text-white transition hover:bg-gold-500"
                    title="Add to cart"
                  >
                    <FiShoppingCart />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPayModal && selectedProduct && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (payStatus !== 'pending' && !paying) setShowPayModal(false)
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-charcoal-900">
              Pay with M-Pesa
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedProduct.name} — KES {selectedProduct.price}
            </p>

            <div className="mt-5">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                placeholder="07XX XXX XXX or 2547XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={paying || payStatus === 'pending'}
                className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />
            </div>

            <button
              onClick={handleMpesaPay}
              disabled={paying || payStatus === 'pending'}
              className="mt-5 w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              {payStatus === 'pending'
                ? 'Waiting for M-Pesa PIN…'
                : paying
                  ? 'Sending STK Push…'
                  : `Pay KES ${selectedProduct.price} via M-Pesa`}
            </button>

            {payStatus === 'pending' && (
              <p className="mt-3 text-center text-sm text-amber-700">
                {payMessage}
              </p>
            )}
            {payStatus === 'success' && (
              <p className="mt-3 text-center text-sm text-green-700">
                {payMessage}
              </p>
            )}
            {payStatus === 'error' && (
              <p className="mt-3 text-center text-sm text-red-600">
                {payMessage}
              </p>
            )}

            <button
              onClick={() => setShowPayModal(false)}
              disabled={paying || payStatus === 'pending'}
              className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
