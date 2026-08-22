import { FiCheckCircle, FiTruck, FiShield } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

const features = [
  {
    icon: <FiCheckCircle className="text-3xl text-gold-500" />,
    title: 'Premium Quality',
    desc: 'Hand-selected cereals and foodstuffs from trusted suppliers.',
  },
  {
    icon: <FiTruck className="text-3xl text-gold-500" />,
    title: 'Fast Delivery',
    desc: 'Quick delivery across Kiambu, Kikuyu and surrounding areas.',
  },
  {
    icon: <FiShield className="text-3xl text-gold-500" />,
    title: 'Fresh Stock',
    desc: 'Regular restocking ensures you always get the freshest products.',
  },
  {
    icon: <FaWhatsapp className="text-3xl text-gold-500" />,
    title: 'Easy Ordering',
    desc: 'Order via WhatsApp or our website — simple and convenient.',
  },
]

export default function WhyUs() {
  return (
    <section id="why-us" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="section-title">Why Choose Samolvic?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            We combine quality products with reliable service so you never run
            out of essentials.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-stone-100 bg-stone-50 p-6 text-center transition hover:border-gold-200 hover:shadow-md"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-50">
                {item.icon}
              </div>
              <h3 className="font-semibold text-charcoal-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
