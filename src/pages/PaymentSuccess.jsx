import { useState, useEffect } from 'react'
import { FiCheckCircle, FiHome } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  const orderNumber = searchParams.get('orderNumber') || 'N/A'
  const amount = searchParams.get('amount') || '0'
  const method = searchParams.get('method') || 'Card Payment'

  useEffect(() => {
    // Simulate fetching order details
    // In production, fetch from your API using orderNumber
    const fetchOrderDetails = async () => {
      try {
        // Example: const response = await fetch(`/api/orders/${orderNumber}`)
        // const data = await response.json()
        // setOrderDetails(data)

        // For now, use URL params
        setOrderDetails({
          orderNumber,
          amount: parseInt(amount),
          method,
          timestamp: new Date().toLocaleString(),
          status: 'Completed',
          items: [], // Would be fetched from backend
        })
      } catch (error) {
        console.error('Error fetching order details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderNumber, amount, method])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* SUCCESS ICON */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-200 rounded-full animate-pulse"></div>
            <div className="relative bg-green-100 rounded-full p-4">
              <FiCheckCircle size={64} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* MAIN MESSAGE */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Payment Successful! 🎉
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Your order has been confirmed
        </p>

        {/* ORDER DETAILS CARD */}
        {!loading && orderDetails && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5 mb-6 space-y-4">
            {/* Order Number */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Order Number</span>
              <span className="text-lg font-bold text-green-700 font-mono">
                {orderDetails.orderNumber}
              </span>
            </div>

            <div className="border-t border-green-200"></div>

            {/* Amount */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Amount Paid</span>
              <span className="text-2xl font-bold text-green-700">
                KES {orderDetails.amount.toLocaleString()}
              </span>
            </div>

            <div className="border-t border-green-200"></div>

            {/* Payment Method */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Payment Method</span>
              <span className="text-sm font-semibold text-gray-800">
                {orderDetails.method === 'M-Pesa' ? '💚 M-Pesa' : '💳 ' + orderDetails.method}
              </span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <span className="inline-block bg-green-200 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                ✓ {orderDetails.status}
              </span>
            </div>

            {/* Timestamp */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Date & Time</span>
              <span className="text-xs text-gray-700">{orderDetails.timestamp}</span>
            </div>
          </div>
        )}

        {/* NEXT STEPS */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-3">What Happens Next?</h3>
          <ul className="space-y-2 text-xs text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Confirmation email will be sent to your inbox</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>We'll prepare your order immediately</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>You'll receive delivery updates via SMS</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Estimated delivery in 1-2 business days</span>
            </li>
          </ul>
        </div>

        {/* IMPORTANT WARNING */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Important:</strong> Your payment has been successfully processed. 
            Do NOT attempt to pay again. Your order is confirmed.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-3">
          {/* TRACK ORDER BUTTON */}
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 active:scale-95"
          >
            📦 Track My Order
          </button>

          {/* CONTINUE SHOPPING BUTTON */}
          <button
            onClick={() => navigate('/shop')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 active:scale-95"
          >
            🛒 Continue Shopping
          </button>

          {/* HOME BUTTON */}
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <FiHome size={20} />
            Back to Home
          </button>
        </div>

        {/* SUPPORT INFO */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-600 mb-2">Need help?</p>
          <a
            href="https://wa.me/254112318696"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 font-semibold text-sm"
          >
            💬 Contact us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}