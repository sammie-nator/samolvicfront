import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

// Change this to your deployed backend URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

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

  const handleMpesaPay = async () => {
    if (!phone || phone.length < 9) {
      setPayStatus('error')
      setPayMessage('Please enter a valid M-Pesa phone number')
      return
    }
    if (cart.length === 0) return

    setPaying(true)
    setPayStatus(null)
    setPayMessage('')

    try {
      const res = await fetch(`${API_URL}/api/mpesa/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          amount: cartTotal,
          accountReference: `Order-${Date.now()}`,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setPayStatus('success')
        setPayMessage(
          'STK Push sent! Check your phone and enter your M-Pesa PIN to complete payment.'
        )
      } else {
        setPayStatus('error')
        setPayMessage(
          data.error?.errorMessage || data.error || 'Payment failed. Try again.'
        )
      }
    } catch (err) {
      setPayStatus('error')
      setPayMessage('Could not reach payment server. Please try again later.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">Your Cart ({cartCount})</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-stone-100"
          >
            <FiX size={22} />
          </button>
        </div>

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
                        className="h-7 w-7 rounded-full bg-stone-100 text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="h-7 w-7 rounded-full bg-stone-100 text-sm font-bold"
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

        {cart.length > 0 && (
          <div className="space-y-4 border-t p-5">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>KES {cartTotal.toLocaleString()}</span>
            </div>

            {/* Primary: M-Pesa */}
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="mb-2 text-sm font-medium text-green-800">
                Pay with M-Pesa
              </p>
              <input
                type="tel"
                placeholder="07XX XXX XXX or 2547XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mb-3 w-full rounded-lg border border-green-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              <button
                onClick={handleMpesaPay}
                disabled={paying}
                className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                {paying
                  ? 'Sending STK Push...'
                  : `Pay KES ${cartTotal.toLocaleString()} via M-Pesa`}
              </button>

              {payStatus === 'success' && (
                <p className="mt-2 text-center text-sm text-green-700">
                  {payMessage}
                </p>
              )}
              {payStatus === 'error' && (
                <p className="mt-2 text-center text-sm text-red-600">
                  {payMessage}
                </p>
              )}
            </div>

            {/* Secondary: WhatsApp (fallback) */}
            <button
              onClick={placeOrder}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-stone-50"
              disabled={orderStatus === 'sending'}
            >
              <FaWhatsapp className="text-green-600" />
              {orderStatus === 'sending'
                ? 'Processing...'
                : 'Order via WhatsApp instead'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
