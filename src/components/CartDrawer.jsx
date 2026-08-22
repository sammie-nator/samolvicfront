import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

// 🔧 CONFIGURE YOUR BACKEND URL HERE
// For local testing: 'http://localhost:10000'
// For production (Render): 'https://your-backend.onrender.com'
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
  const [phone, setPhone] = useState('')
  const [paying, setPaying] = useState(false)
  const [payStatus, setPayStatus] = useState(null)
  const [payMessage, setPayMessage] = useState('')

  if (!open) return null

  /**
   * Handle M-Pesa payment
   */
  const handleMpesaPay = async () => {
    // ========== VALIDATION ==========
    if (!phone || phone.trim() === '') {
      setPayStatus('error')
      setPayMessage('Please enter your phone number')
      return
    }

    if (phone.replace(/\D/g, '').length < 9) {
      setPayStatus('error')
      setPayMessage('Please enter a valid phone number (e.g., 0712345678)')
      return
    }

    if (cart.length === 0) {
      setPayStatus('error')
      setPayMessage('Your cart is empty')
      return
    }

    // ========== PAYMENT FLOW ==========
    setPaying(true)
    setPayStatus(null)
    setPayMessage('')

    try {
      console.log('📱 Initiating M-Pesa payment...')
      console.log('  Backend URL:', API_URL)
      console.log('  Phone:', phone)
      console.log('  Amount:', cartTotal)

      const response = await fetch(`${API_URL}/api/mpesa/stkpush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.trim(),
          amount: cartTotal,
          accountReference: `Order-${Date.now()}`,
        }),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Response data:', data)

      // ========== SUCCESS ==========
      if (data.success) {
        setPayStatus('success')
        setPayMessage(
          '✓ STK Push sent! Check your phone and enter your M-Pesa PIN to complete the payment.'
        )
        setPhone('')
        // Optionally close cart after success
        setTimeout(() => {
          onClose()
          setPayStatus(null)
        }, 3000)
      }
      // ========== ERROR FROM BACKEND ==========
      else {
        setPayStatus('error')

        // Try to extract error message from different response formats
        let errorMessage = 'Payment failed. Try again.'

        if (data.error?.errorMessage) {
          errorMessage = data.error.errorMessage
        } else if (data.error?.error) {
          errorMessage = data.error.error
        } else if (typeof data.error === 'string') {
          errorMessage = data.error
        }

        console.error('Backend error:', errorMessage)
        setPayMessage(errorMessage)
      }
    }
    // ========== NETWORK ERROR ==========
    catch (err) {
      console.error('Network error:', err)
      setPayStatus('error')

      if (err.message.includes('HTTP')) {
        setPayMessage(
          'Cannot reach payment server. Check if your backend is running on Render.'
        )
      } else if (err.message.includes('fetch')) {
        setPayMessage('Network error. Check your internet connection.')
      } else {
        setPayMessage(`Error: ${err.message}`)
      }
    }
    //========== CLEANUP ==========
    finally {
      setPaying(false)
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

            {/* M-PESA PAYMENT */}
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="mb-2 text-sm font-medium text-green-800">
                💚 Pay with M-Pesa
              </p>

              {/* PHONE INPUT */}
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={paying}
                className="mb-3 w-full rounded-lg border border-green-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />

              {/* PAY BUTTON */}
              <button
                onClick={handleMpesaPay}
                disabled={paying || cart.length === 0}
                className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:bg-gray-400"
              >
                {paying ? '⏳ Sending STK Push...' : `💳 Pay KES ${cartTotal.toLocaleString()}`}
              </button>

              {/* STATUS MESSAGES */}
              {payStatus === 'success' && (
                <div className="mt-3 rounded-lg bg-green-100 p-3">
                  <p className="text-center text-sm text-green-800">
                    ✅ {payMessage}
                  </p>
                </div>
              )}

              {payStatus === 'error' && (
                <div className="mt-3 rounded-lg bg-red-100 p-3">
                  <p className="text-center text-sm text-red-800">
                    ❌ {payMessage}
                  </p>
                </div>
              )}
            </div>

            {/* WHATSAPP FALLBACK */}
            <button
              onClick={placeOrder}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-stone-50 disabled:opacity-60"
              disabled={orderStatus === 'sending'}
            >
              <FaWhatsapp className="text-green-600" />
              {orderStatus === 'sending' ? 'Processing...' : 'Order via WhatsApp'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
