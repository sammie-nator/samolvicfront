import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

// Configure your backend URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000'

console.log('🔗 API_URL configured to:', API_URL)

export default function CartDrawer({
  open,
  onClose,
  cart,
  cartCount,
  cartTotal,
  updateQty,
  placeOrder,
  orderStatus,
}) {
  // M-Pesa State
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [mpesaPaying, setMpesaPaying] = useState(false)
  const [mpesaStatus, setMpesaStatus] = useState(null)
  const [mpesaMessage, setMpesaMessage] = useState('')

  // Paystack State
  const [paystackEmail, setPaystackEmail] = useState('')
  const [paystackPaying, setPaystackPaying] = useState(false)
  const [paystackStatus, setPaystackStatus] = useState(null)
  const [paystackMessage, setPaystackMessage] = useState('')

  // UI State
  const [paymentMethod, setPaymentMethod] = useState(null)

  if (!open) return null

  const getErrorMessage = (errorData) => {
    if (!errorData) return 'Unknown error occurred'
    if (typeof errorData === 'string') return errorData
    if (typeof errorData === 'object') {
      if (errorData.errorMessage) return errorData.errorMessage
      if (errorData.message) return errorData.message
      if (errorData.error) {
        if (typeof errorData.error === 'string') return errorData.error
        if (errorData.error.errorMessage) return errorData.error.errorMessage
      }
    }
    return 'Unknown error occurred'
  }

  // ============================================================================
  // M-PESA HANDLER
  // ============================================================================

  const handleMpesaPay = async () => {
    if (!mpesaPhone || mpesaPhone.trim() === '') {
      setMpesaStatus('error')
      setMpesaMessage('Please enter your phone number')
      return
    }

    if (mpesaPhone.replace(/\D/g, '').length < 9) {
      setMpesaStatus('error')
      setMpesaMessage('Invalid phone number')
      return
    }

    if (cart.length === 0) {
      setMpesaStatus('error')
      setMpesaMessage('Your cart is empty')
      return
    }

    setMpesaPaying(true)
    setMpesaStatus(null)
    setMpesaMessage('')

    try {
      console.log('📱 M-Pesa Payment...')

      const response = await fetch(`${API_URL}/api/mpesa/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: mpesaPhone.trim(),
          amount: cartTotal,
          accountReference: `Order-${Date.now()}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setMpesaStatus('success')
        setMpesaMessage('✅ STK Push sent! Check your phone and enter M-Pesa PIN.')
        setMpesaPhone('')

        setTimeout(() => {
          onClose()
          setMpesaStatus(null)
          setPaymentMethod(null)
        }, 3000)
      } else {
        setMpesaStatus('error')
        setMpesaMessage(`❌ ${getErrorMessage(data?.error)}`)
      }
    } catch (err) {
      console.error('M-Pesa error:', err)
      setMpesaStatus('error')
      setMpesaMessage(`❌ ${err.message}`)
    } finally {
      setMpesaPaying(false)
    }
  }

  // ============================================================================
  // PAYSTACK HANDLER
  // ============================================================================

  const handlePaystackPay = async () => {
    if (!paystackEmail || paystackEmail.trim() === '') {
      setPaystackStatus('error')
      setPaystackMessage('Please enter your email address')
      return
    }

    // Simple email validation
    if (!paystackEmail.includes('@')) {
      setPaystackStatus('error')
      setPaystackMessage('Please enter a valid email address')
      return
    }

    if (cart.length === 0) {
      setPaystackStatus('error')
      setPaystackMessage('Your cart is empty')
      return
    }

    setPaystackPaying(true)
    setPaystackStatus(null)
    setPaystackMessage('')

    try {
      console.log('💳 Paystack Payment...')

      const response = await fetch(`${API_URL}/api/paystack/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: paystackEmail.trim(),
          amount: cartTotal,
          accountReference: `Order-${Date.now()}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data?.authorizationUrl) {
        console.log('Redirecting to Paystack...')
        // Redirect user to Paystack payment page
        window.location.href = data.data.authorizationUrl
      } else {
        setPaystackStatus('error')
        setPaystackMessage(`❌ ${getErrorMessage(data?.error)}`)
      }
    } catch (err) {
      console.error('Paystack error:', err)
      setPaystackStatus('error')
      setPaystackMessage(`❌ ${err.message}`)
    } finally {
      setPaystackPaying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">Your Cart ({cartCount})</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-stone-100">
            <FiX size={22} />
          </button>
        </div>

        {/* CART ITEMS */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <p className="py-12 text-center text-gray-500">Your cart is empty</p>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-stone-100 p-3"
                >
                  <span className="text-3xl">{item.image}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      KES {item.price} / {item.unit}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="h-7 w-7 rounded-full bg-stone-100 text-sm font-bold hover:bg-stone-200"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="h-7 w-7 rounded-full bg-stone-100 text-sm font-bold hover:bg-stone-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold">KES {item.price * item.qty}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CHECKOUT SECTION */}
        {cart.length > 0 && (
          <div className="space-y-4 border-t p-5">
            {/* TOTAL */}
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>KES {cartTotal.toLocaleString()}</span>
            </div>

            {/* PAYMENT METHOD SELECTION */}
            {!paymentMethod ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600">Choose Payment Method:</p>

                {/* M-Pesa Button */}
                <button
                  onClick={() => setPaymentMethod('mpesa')}
                  className="w-full rounded-lg border-2 border-green-500 bg-green-50 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                >
                  💚 M-Pesa STK Push
                </button>

                {/* Paystack Button */}
                <button
                  onClick={() => setPaymentMethod('paystack')}
                  className="w-full rounded-lg border-2 border-blue-500 bg-blue-50 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  💳 Paystack Card Payment
                </button>

                {/* WhatsApp Fallback */}
                <button
                  onClick={placeOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-stone-50"
                  disabled={orderStatus === 'sending'}
                >
                  <FaWhatsapp className="text-green-600" />
                  {orderStatus === 'sending' ? 'Processing...' : 'Order via WhatsApp'}
                </button>
              </div>
            ) : null}

            {/* M-PESA PAYMENT */}
            {paymentMethod === 'mpesa' && (
              <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-green-800">💚 Pay with M-Pesa</p>
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="text-xs text-green-600 hover:text-green-700"
                  >
                    Change
                  </button>
                </div>

                <input
                  type="tel"
                  placeholder="Enter phone: 0712345678"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  disabled={mpesaPaying}
                  className="mb-3 w-full rounded-lg border border-green-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                />

                <button
                  onClick={handleMpesaPay}
                  disabled={mpesaPaying || cart.length === 0}
                  className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:bg-gray-400"
                >
                  {mpesaPaying ? '⏳ Sending...' : `💳 Pay KES ${cartTotal.toLocaleString()}`}
                </button>

                {mpesaStatus === 'success' && mpesaMessage && (
                  <div className="mt-3 rounded-lg bg-green-100 p-3">
                    <p className="text-center text-sm font-medium text-green-800">{mpesaMessage}</p>
                  </div>
                )}

                {mpesaStatus === 'error' && mpesaMessage && (
                  <div className="mt-3 rounded-lg bg-red-100 p-3">
                    <p className="text-center text-sm font-medium text-red-800">{mpesaMessage}</p>
                  </div>
                )}
              </div>
            )}

            {/* PAYSTACK PAYMENT */}
            {paymentMethod === 'paystack' && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-800">💳 Pay with Paystack</p>
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Change
                  </button>
                </div>

                <input
                  type="email"
                  placeholder="Enter email"
                  value={paystackEmail}
                  onChange={(e) => setPaystackEmail(e.target.value)}
                  disabled={paystackPaying}
                  className="mb-3 w-full rounded-lg border border-blue-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />

                <button
                  onClick={handlePaystackPay}
                  disabled={paystackPaying || cart.length === 0}
                  className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {paystackPaying ? '⏳ Processing...' : `💳 Pay KES ${cartTotal.toLocaleString()}`}
                </button>

                {paystackStatus === 'success' && paystackMessage && (
                  <div className="mt-3 rounded-lg bg-green-100 p-3">
                    <p className="text-center text-sm font-medium text-green-800">{paystackMessage}</p>
                  </div>
                )}

                {paystackStatus === 'error' && paystackMessage && (
                  <div className="mt-3 rounded-lg bg-red-100 p-3">
                    <p className="text-center text-sm font-medium text-red-800">{paystackMessage}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
