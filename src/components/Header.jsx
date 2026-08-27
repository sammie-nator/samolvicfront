import { useNavigate } from 'react-router-dom'

export default function Header({ cartCount, onCartClick }) {
  const navigate = useNavigate()

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80"
          onClick={() => navigate('/')}
        >
          <span className="text-3xl">🥬</span>
          <h1 className="text-2xl font-bold text-green-600">Samolvic</h1>
        </div>

        <nav className="flex items-center gap-6">
          <button
            onClick={() => navigate('/shop')}
            className="text-gray-700 hover:text-green-600 font-medium transition"
          >
            Shop
          </button>

          <button
            onClick={onCartClick}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <span>🛒</span>
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1">
                {cartCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
