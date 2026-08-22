import { useState, useEffect } from 'react'
import { FiPackage, FiArrowRight, FiTruck, FiShield, FiStar } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { WHATSAPP_NUMBER } from '../constants'

const slides = [
  {
    id: 1,
    badge: 'Premium Cereals & Foodstuffs',
    title: 'Quality Foodstuffs',
    highlight: 'Delivered Fresh',
    description:
      'Samolvic brings you the finest cereals, pulses and kitchen essentials. Order online and enjoy fast delivery across Kiambu and Nairobi.',
    cta: 'Shop Now',
  },
  {
    id: 2,
    badge: 'Farm Fresh Selection',
    title: 'Wholesome Grains',
    highlight: 'Straight to Your Kitchen',
    description:
      'From maize flour to beans, rice and more — carefully sourced, cleaned and packed for your family’s everyday needs.',
    cta: 'Browse Products',
  },
  {
    id: 3,
    badge: 'Fast & Reliable',
    title: 'Order Today',
    highlight: 'Delivered Tomorrow',
    description:
      'Same-day and next-day delivery available across Kiambu and Nairobi. Quality you can trust, convenience you’ll love.',
    cta: 'Order via WhatsApp',
  },
]

export default function Hero({ scrollTo }) {
  const [current, setCurrent] = useState(0)

  // Autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [])

  const goTo = (index) => setCurrent(index)

  return (
    <section
      id="home"
      className="relative h-[90vh] min-h-[640px] overflow-hidden"
    >
      {/* Animated background gradient (no external images needed) */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-stone-900 transition-all duration-1000" />
      <div
        className="absolute inset-0 opacity-30 transition-opacity duration-1000"
        style={{
          backgroundImage: `
            radial-gradient(circle at ${20 + current * 25}% 50%, #c08e3a 0%, transparent 50%),
            radial-gradient(circle at ${80 - current * 20}% 20%, #c08e3a 0%, transparent 40%)
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/15 px-4 py-1.5 text-sm text-gold-300 backdrop-blur-sm">
            <FiPackage className="text-gold-400" />
            {slides[current].badge}
          </div>

          {/* Title with fade */}
          <h1
            key={slides[current].id}
            className="animate-fade-in font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            {slides[current].title}
            <span className="mt-2 block text-gold-400">
              {slides[current].highlight}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-stone-300">
            {slides[current].description}
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => scrollTo('products')}
              className="btn-primary group"
            >
              {slides[current].cta}
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Samolvic%20Technologies%2C%20I%20would%20like%20to%20place%20an%20order.`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary border-gold-400/80 text-gold-300 hover:bg-gold-500 hover:text-white"
            >
              <FaWhatsapp className="text-lg" />
              WhatsApp Order
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-stone-400">
            <span className="flex items-center gap-2">
              <FiTruck className="text-gold-400" /> Fast Delivery
            </span>
            <span className="flex items-center gap-2">
              <FiShield className="text-gold-400" /> Quality Guaranteed
            </span>
            <span className="flex items-center gap-2">
              <FiStar className="text-gold-400" /> Fresh Stock
            </span>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === current
                ? 'w-10 bg-gold-400'
                : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    
    </section>
  )
}
