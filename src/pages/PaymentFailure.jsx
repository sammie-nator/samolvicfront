import { useState, useEffect } from 'react'
import { FiAlertCircle, FiHome, FiArrowLeft } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function PaymentFailure() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [countdown, setCountdown] = useState(10)

  const errorCode = searchParams.get('errorCode') || 'UNKNOWN_ERROR'
  const errorMessage = searchParams.get('errorMessage') || 'Payment could not be processed'
  const amount = searchParams.get('amount') || '0'
  const method = searchParams.get('method') || 'Payment'

  // Auto-redirect to shop after 10 seconds
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/shop')
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, navigate])

  // Helpful error messages
  const getErrorDetails = () => {
    switch (errorCode) {
      case 'INSUFFICIENT_FUNDS':
        return {
          title: 'Insufficient Funds',
          description: 'Your account does not have enough balance. Please check and try again.',
          suggestion: 'Ensure you have enough money in your M-Pesa or bank account.',
        }
      case 'INVALID_CREDENTIALS':
        return {
          title: 'Invalid Credentials',
          description: 'The payment details you entered were incorrect.',
          suggestion: 'Please check your phone number or card details and try again.',
        }
      case 'TRANSACTION_DECLINED':
        return {
          title: 'Transaction Declined',
          description: 'Your payment was declined by your bank or payment provider.',
          suggestion: 'Contact your bank or try a different payment method.',
        }
      case 'TIMEOUT':
        return {
          title: 'Request Timeout',
          description: 'The payment took too long to process.',
          suggestion: 'Please try again. Check your M-Pesa or bank account to ensure no duplicate charge occurred.',
        }
      case 'NETWORK_ERROR':
        return {
          title: 'Network Error',
          description: 'There was a problem connecting to the payment server.',
          suggestion: 'Check your internet connection and try again.',
        }
      case 'CANCELLED':
        return {
          title: 'Payment Cancelled',
          description: 'You cancelled the payment.',
          suggestion: 'Click "Try Again" to retry your payment when ready.',
        }
      default:
        return {
          title: 'Payment Failed',
          description: errorMessage,
          suggestion: 'Please try again or contact support for assistance.',
        }
    }
  }

  const errorDetails = getErrorDetails()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* ERROR ICON */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-200 rounded-full animate-pulse"></div>
            <div className="relative bg-red-100 rounded-full p-4">
              <FiAlertCircle size={64} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* ERROR TITLE */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Payment Failed ❌
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {errorDetails.title}
        </p>

        {/* ERROR DETAILS CARD */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5 mb-6 space-y-4">
          {/* Error Message */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Error Details</p>
            <p className="text-sm text-red-700 bg-white p-3 rounded border border-red-200">
              {errorDetails.description}
            </p>
          </div>

          {/* Amount */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Attempted Amount</p>
            <p className="text-2xl font-bold text-red-700">
              KES {parseInt(amount).toLocaleString()}
            </p>
          </div>

          {/* Error Code */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">Error Code</span>
            <span className="text-xs font-mono text-red-700 bg-red-100 px-3 py-1 rounded">
              {errorCode}
            </span>
          </div>
        </div>

        {/* SUGGESTION BOX */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 What You Can Do:</h3>
          <p className="text-xs text-blue-800 mb-3">{errorDetails.suggestion}</p>
          
          <div className="space-y-2 text-xs text-blue-800">
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <span>Check if you have enough balance</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <span>Verify your internet connection</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <span>Try a different payment method</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <span>Contact support if issues persist</span>
            </div>
          </div>
        </div>

        {/* IMPORTANT NOTE */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-xs text-yellow-800">
            <strong>✓ Good News:</strong> No charge was made to your account. Your cart is still saved.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-3">
          {/* RETRY PAYMENT BUTTON */}
          <button
            onClick={() => navigate('/shop')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 active:scale-95"
          >
            🔄 Try Again
          </button>

          {/* CHANGE METHOD BUTTON */}
          <button
            onClick={() => navigate('/shop')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 active:scale-95"
          >
            💳 Try Different Method
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

        {/* AUTO-REDIRECT NOTICE */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">
            Auto-redirecting to shop in <span className="font-bold text-gray-700">{countdown}</span> seconds...
          </p>
          <button
            onClick={() => setCountdown(0)}
            className="w-full text-xs text-gray-500 hover:text-gray-700 transition"
          >
            Skip
          </button>
        </div>

        {/* SUPPORT INFO */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600 mb-2">Still having issues?</p>
          <a
            href="https://wa.me/254112318696"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 font-semibold text-sm"
          >
            💬 Contact Support on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}