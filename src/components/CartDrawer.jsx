import { useState } from 'react'
import { FiX, FiCheckCircle } from 'react-icons/fi'
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

  // Order Confirmation State
  const [orderConfirmation, setOrderConfirmation] = useState(null)

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

    const orderNumber = `ORD-${Date.now()}`

    try {
      console.log('📱 M-Pesa Payment...')

      const response = await fetch(`${API_URL}/api/mpesa/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: mpesaPhone.trim(),
          amount: cartTotal,
          accountReference: orderNumber,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        setMpesaStatus('error')
        setMpesaMessage(`❌ ${getErrorMessage(data?.error)}`)
        setMpesaPaying(false)
        return
      }

      // STK sent — wait for callback confirmation before redirect
      setMpesaStatus('pending')
      setMpesaMessage(
        '✅ STK Push sent! Enter your M-Pesa PIN on your phone. Waiting for confirmation…'
      )

      const maxAttempts = 40 // ~2 minutes at 3s interval
      let attempts = 0

      const poll = async () => {
        attempts += 1
        try {
          const statusRes = await fetch(
            `${API_URL}/api/mpesa/status/${encodeURIComponent(orderNumber)}`
          )
          if (statusRes.ok) {
            const statusData = await statusRes.json()
            if (statusData.status === 'COMPLETED') {
              setMpesaStatus('success')
              setMpesaMessage('✅ Payment confirmed!')
              setMpesaPaying(false)
              const successUrl = `/payment/success?orderNumber=${orderNumber}&amount=${cartTotal}&method=M-Pesa`
              console.log('Payment confirmed, redirecting:', successUrl)
              window.location.href = successUrl
              return
            }
            if (statusData.status === 'FAILED') {
              setMpesaStatus('error')
              setMpesaMessage(
                `❌ Payment failed: ${statusData.failureReason || 'Cancelled or declined'}`
              )
              setMpesaPaying(false)
              return
            }
          }
        } catch (pollErr) {
          console.warn('Status poll error:', pollErr)
        }

        if (attempts >= maxAttempts) {
          setMpesaStatus('error')
          setMpesaMessage(
            `⏱️ Timed out waiting for payment. If you paid, contact support with order ${orderNumber}`
          )
          setMpesaPaying(false)
          return
        }

        setTimeout(poll, 3000)
      }

      setTimeout(poll, 3000)
    } catch (err) {
      console.error('M-Pesa error:', err)
      setMpesaStatus('error')
      setMpesaMessage(`❌ ${err.message}`)
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

      const orderNumber = `ORD-${Date.now()}`

      const response = await fetch(`${API_URL}/api/paystack/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: paystackEmail.trim(),
          amount: cartTotal,
          accountReference: orderNumber,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data?.authorizationUrl) {
        console.log('Redirecting to Paystack...')

        setPaystackStatus('success')
        setPaystackMessage(
          `✅ Order #${orderNumber} created! Redirecting to payment page...`
        )

        sessionStorage.setItem(
          'paymentOrder',
          JSON.stringify({
            orderNumber,
            reference: data.data.reference,
            amount: cartTotal,
            email: paystackEmail,
            items: cart,
          })
        )

        setTimeout(() => {
          console.log('Redirecting to Paystack authorization URL')
          window.location.href = data.data.authorizationUrl
        }, 2000)
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

  // ============================================================================
  // HANDLE CLOSE AFTER CONFIRMATION
  // ============================================================================

  const handleCloseAfterPayment = () => {
    setOrderConfirmation(null)
    setPaymentMethod(null)
    onClose()
  }

  // ============================================================================
  // RENDER: ORDER CONFIRMATION SCREEN
  // ============================================================================

  if (orderConfirmation) {
    return (
      <div className="fixed inset-0 z-[60] flex justify-end">
        <div className="absolute inset-0 bg-black/40" onClick={handleCloseAfterPayment} />
        <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
          <div className="flex items-center justify-end border-b px-5 py-4">
            <button onClick={handleCloseAfterPayment} className="rounded-full p-1 hover:bg-stone-100">
              <FiX size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <FiCheckCircle size={48} className="text-green-600" />
              </div>
            </div>

            <h2 className="mb-2 text-center text-2xl font-bold text-gray-800">
              Thank You! 🎉
            </h2>
            <p className="mb-6 text-center text-sm text-gray-600">
              Your payment has been received
            </p>

            <div className="mb-6 rounded-lg border-2 border-green-200 bg-green-50 p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Order Number
                  </span>
                  <span className="font-mono text-sm font-bold text-gray-800">
                    {orderConfirmation.orderNumber}
                  </span>
                </div>

                <div className="border-t border-green-200 pt-3" />

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Amount Paid
                  </span>
                  <span className="text-lg font-bold text-green-700">
                    KES {orderConfirmation.amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Payment Method
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {orderConfirmation.method === 'M-Pesa'
                      ? '💚 M-Pesa'
                      : '💳 Paystack'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Date & Time
                  </span>
                  <span className="text-xs text-gray-700">
                    {orderConfirmation.timestamp}
                  </span>
                </div>

                <div className="border-t border-green-200 pt-3" />

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Status
                  </span>
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {orderConfirmation.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-sm font-bold text-gray-700">
                Order Items ({orderConfirmation.items.length})
              </h3>
              <div className="space-y-2">
                {orderConfirmation.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded bg-gray-50 p-2"
                  >
                    <span className="text-sm">
                      {item.image} {item.name} x{item.qty}
                    </span>
                    <span className="text-sm font-semibold">
                      KES {item.price * item.qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 rounded-lg bg-blue-50 p-4">
              <h3 className="mb-2 text-sm font-bold text-blue-900">
                What Happens Next?
              </h3>
              <ul className="space-y-2 text-xs text-blue-800">
                <li>✓ We'll prepare your order</li>
                <li>✓ You'll receive a confirmation SMS</li>
                <li>✓ Delivery in 1-2 business days</li>
                <li>✓ Track your order in your account</li>
              </ul>
            </div>

            <div className="mb-6 rounded-lg bg-yellow-50 p-3">
              <p className="text-xs text-yellow-800">
                <strong>⚠️ Important:</strong> Your payment has been completed.
                You can safely close this window. Do not try to pay again.
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t p-5">
            <button
              onClick={handleCloseAfterPayment}
              className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Continue Shopping
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.location.href = 'https://wa.me/254112318696'
                }}
                className="flex-1 rounded-lg bg-green-500 py-2.5 text-xs font-semibold text-white transition hover:bg-green-600"
              >
                <FaWhatsapp className="mb-1 inline" /> WhatsApp Support
              </button>
              <button
                onClick={handleCloseAfterPayment}
                className="flex-1 rounded-lg bg-gray-200 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: NORMAL CART VIEW
  // ============================================================================

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">Your Cart ({cartCount})</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-stone-100">
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

        {cart.length > 0 && (
          <div className="space-y-4 border-t p-5">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>KES {cartTotal.toLocaleString()}</span>
            </div>

            {!paymentMethod ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600">
                  Choose Payment Method:
                </p>

                <button
                  onClick={() => setPaymentMethod('mpesa')}
                  className="w-full rounded-lg border-2 border-green-500 bg-green-50 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                >
                  💚 M-Pesa STK Push
                </button>

                <button
                  onClick={() => setPaymentMethod('paystack')}
                  className="w-full rounded-lg border-2 border-blue-500 bg-blue-50 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  💳 Paystack Card Payment
                </button>

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

            {paymentMethod === 'mpesa' && (
              <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-green-800">
                    💚 Pay with M-Pesa
                  </p>
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
                  disabled={mpesaPaying || mpesaStatus === 'pending'}
                  className="mb-3 w-full rounded-lg border border-green-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                />

                <button
                  onClick={handleMpesaPay}
                  disabled={mpesaPaying || mpesaStatus === 'pending' || cart.length === 0}
                  className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:bg-gray-400"
                >
                  {mpesaStatus === 'pending'
                    ? '⏳ Waiting for M-Pesa PIN…'
                    : mpesaPaying
                      ? '⏳ Sending STK…'
                      : `📱 Pay KES ${cartTotal.toLocaleString()}`}
                </button>

                {mpesaStatus === 'pending' && mpesaMessage && (
                  <div className="mt-3 rounded-lg bg-amber-100 p-3">
                    <p className="text-center text-sm font-medium text-amber-800">
                      {mpesaMessage}
                    </p>
                  </div>
                )}

                {mpesaStatus === 'success' && mpesaMessage && (
                  <div className="mt-3 rounded-lg bg-green-100 p-3">
                    <p className="text-center text-sm font-medium text-green-800">
                      {mpesaMessage}
                    </p>
                  </div>
                )}

                {mpesaStatus === 'error' && mpesaMessage && (
                  <div className="mt-3 rounded-lg bg-red-100 p-3">
                    <p className="text-center text-sm font-medium text-red-800">
                      {mpesaMessage}
                    </p>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'paystack' && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-800">
                    💳 Pay with Paystack
                  </p>
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
                    <p className="text-center text-sm font-medium text-green-800">
                      {paystackMessage}
                    </p>
                  </div>
                )}

                {paystackStatus === 'error' && paystackMessage && (
                  <div className="mt-3 rounded-lg bg-red-100 p-3">
                    <p className="text-center text-sm font-medium text-red-800">
                      {paystackMessage}
                    </p>
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
