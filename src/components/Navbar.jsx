import { useState } from 'react'
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { WHATSAPP_NUMBER } from '../constants'

export default function Navbar({ cartCount, onCartOpen, scrollTo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleScroll = (id) => {
    scrollTo(id)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => handleScroll('home')}
        >
          <img
            src="/logo.png"
            alt="Samolvic Technologies"
            className="h-12 w-12 object-contain"
          />
          <div className="hidden sm:block">
            <p className="font-serif text-lg font-bold tracking-wide text-gold-600">
              SAMOLVIC
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {['Home', 'Products', 'Why Us', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() =>
                handleScroll(item.toLowerCase().replace(' ', '-'))
              }
              className="text-sm font-medium text-gray-600 transition hover:text-gold-600"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 sm:flex"
          >
            <FaWhatsapp className="text-lg" />
            WhatsApp
          </a>

          <button
            onClick={onCartOpen}
            className="relative rounded-full bg-charcoal-900 p-2.5 text-white transition hover:bg-gold-600"
          >
            <FiShoppingCart className="text-lg" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            className="rounded-lg p-2 text-gray-600 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-stone-100 bg-white px-4 py-4 md:hidden">
          {['Home', 'Products', 'Why Us', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() =>
                handleScroll(item.toLowerCase().replace(' ', '-'))
              }
              className="block w-full py-3 text-left text-sm font-medium text-gray-700"
            >
              {item}
            </button>
          ))}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center gap-2 rounded-full bg-green-500 px-4 py-2.5 text-sm font-medium text-white"
          >
            <FaWhatsapp /> Order on WhatsApp
          </a>
        </div>
      )}
    </nav>
  )
}
