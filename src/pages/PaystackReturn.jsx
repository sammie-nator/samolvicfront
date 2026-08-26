import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000'

export default function PaystackReturn() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reference = searchParams.get('reference')

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log('🔍 Verifying Paystack payment:', reference)

        // Get order info from session storage
        const paymentOrder = JSON.parse(
          sessionStorage.getItem('paymentOrder') || '{}'
        )

        if (!reference) {
          throw new Error('No payment reference provided')
        }

        // Call backend to verify payment
        const response = await fetch(`${API_URL}/api/paystack/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference }),
        })

        const data = await response.json()

        console.log('📋 Verification response:', data)

        if (data.success) {
          // Payment successful
          console.log('✅ Payment verified successfully')

          // Clear session storage
          sessionStorage.removeItem('paymentOrder')

          // Redirect to success page with order details
          const successUrl = `/payment/success?orderNumber=${paymentOrder.orderNumber || reference}&amount=${paymentOrder.amount || data.amount}&method=Paystack`
          console.log('Redirecting to:', successUrl)
          navigate(successUrl)
        } else {
          // Payment failed
          console.log('❌ Payment verification failed')

          // Clear session storage
          sessionStorage.removeItem('paymentOrder')

          // Redirect to failure page
          const failureUrl = `/payment/failure?errorCode=PAYMENT_FAILED&errorMessage=${encodeURIComponent(data.error || 'Payment could not be verified')}&amount=${paymentOrder.amount || 0}`
          console.log('Redirecting to:', failureUrl)
          navigate(failureUrl)
        }
      } catch (err) {
        console.error('❌ Verification error:', err.message)
        setError(err.message)

        // Clear session storage
        sessionStorage.removeItem('paymentOrder')

        // Redirect to failure page
        setTimeout(() => {
          const failureUrl = `/payment/failure?errorCode=VERIFICATION_ERROR&errorMessage=${encodeURIComponent(err.message)}`
          console.log('Redirecting to:', failureUrl)
          navigate(failureUrl)
        }, 2000)
      } finally {
        setLoading(false)
      }
    }

    // Only verify if we have a reference
    if (reference) {
      verifyPayment()
    } else {
      console.error('No payment reference found')
      setError('No payment reference found')
      setLoading(false)

      // Redirect to failure
      setTimeout(() => {
        navigate('/payment/failure?errorCode=NO_REFERENCE&errorMessage=No+payment+reference+found')
      }, 2000)
    }
  }, [reference, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          {/* Loading spinner */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Loading text */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verifying Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment...
          </p>

          {/* Dots animation */}
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>

          {/* Reference info */}
          <p className="mt-8 text-xs text-gray-500">
            Reference: <span className="font-mono">{reference}</span>
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md p-6">
          {/* Error icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <svg
                className="w-16 h-16 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Error message */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verification Error
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>

          {/* Redirect message */}
          <p className="text-sm text-gray-500">
            You will be redirected to the failure page shortly...
          </p>
        </div>
      </div>
    )
  }

  return null
}
