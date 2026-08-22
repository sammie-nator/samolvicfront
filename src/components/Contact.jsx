import { useState } from 'react'
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { WHATSAPP_NUMBER, PHONE_DISPLAY } from '../constants'

export default function Contact() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [formStatus, setFormStatus] = useState(null)

  const handleContactSubmit = (e) => {
    e.preventDefault()
    setFormStatus('sending')
    const { name, email, phone, message } = contactForm
    const text = `Hello Samolvic Technologies!%0A%0AName: ${name}%0AEmail: ${email}%0APhone: ${phone || 'N/A'}%0A%0AMessage:%0A${message}`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank')
    setFormStatus('success')
    setContactForm({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <section id="contact" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="section-title">Get In Touch</h2>
            <p className="mt-3 text-gray-600">
              Have a bulk order or special request? Reach out — we’re happy to
              help.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600">
                  <FiMapPin />
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">Location</p>
                  <p className="text-sm text-gray-600">
                    Grey House, Ndenderu, Kiambaa, Kiambu County
                  </p>
                  <p className="text-sm text-gray-500">
                    P.O. Box 102 – 00902 Kikuyu
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600">
                  <FiPhone />
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">
                    Phone / WhatsApp
                  </p>
                  <a
                    href={`tel:${PHONE_DISPLAY}`}
                    className="text-sm text-gold-600 hover:underline"
                  >
                    {PHONE_DISPLAY}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600">
                  <FiMail />
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">Email</p>
                  <p className="text-sm text-gray-600">info@samolvic.co.ke</p>
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-600"
            >
              <FaWhatsapp className="text-xl" /> Chat on WhatsApp
            </a>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-charcoal-900">
              Send us a message
            </h3>
            <form onSubmit={handleContactSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
                  placeholder="Samuel Mugo"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
                  placeholder="Tell us about your order or inquiry..."
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={formStatus === 'sending'}
              >
                {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
              </button>

              {formStatus === 'success' && (
                <p className="text-center text-sm text-green-600">
                  Opening WhatsApp… You can send the message from there.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
