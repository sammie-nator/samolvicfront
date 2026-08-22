import { PHONE_DISPLAY } from '../constants'

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-charcoal-950 py-12 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Samolvic"
              className="h-12 w-12 rounded-full bg-white object-contain p-1"
            />
            <div>
              <p className="font-serif text-lg font-bold text-white">
                SAMOLVIC
              </p>
              <p className="text-xs text-stone-400">
                Cereals • Foodstuffs • Catering Supplies
              </p>
            </div>
          </div>
          <div className="text-center text-sm md:text-right">
            <p>Grey House, Ndenderu • Kiambaa, Kiambu</p>
            <p className="mt-1">{PHONE_DISPLAY}</p>
            <p className="mt-3 text-xs text-stone-500">
              © {new Date().getFullYear()} Samolvic Technologies. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
