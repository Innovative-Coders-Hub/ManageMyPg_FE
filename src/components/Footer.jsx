import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-indigo-100">
      <div className="mx-auto max-w-7xl px-4 py-16 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 shadow" />
            <span className="font-extrabold text-xl tracking-tight text-white">
              ManageMyPg
            </span>
          </Link>

          <p className="mt-4 text-sm text-indigo-200 leading-relaxed">
            A simple and reliable platform to manage PG and hostel operations —
            beds, tenants, payments, and occupancy clarity in one place.
          </p>
        </div>

        {/* Product */}
        <div>
          <div className="font-semibold mb-4 text-white">Product</div>
          <ul className="space-y-3 text-sm">
            <li><a href="#features" className="hover:text-white">Features</a></li>
            <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
            <li><a href="#faq" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <div className="font-semibold mb-4 text-white">Company</div>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Blog</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* CTA */}
        <div>
          <div className="font-semibold mb-4 text-white">Get Started</div>
          <p className="text-sm text-indigo-200 mb-4">
            Create your account and start managing your PG with confidence.
          </p>
          <Link
            to="/signup"
            className="inline-block px-5 py-2.5 rounded-xl
                       bg-white text-indigo-800 text-sm font-semibold
                       hover:bg-indigo-50 shadow"
          >
            Create account
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-indigo-700/40 py-5 text-center text-xs text-indigo-300">
        © {new Date().getFullYear()} Copyright By © ManageMyPg. All rights reserved.
      </div>
    </footer>
  )
}
