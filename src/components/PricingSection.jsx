import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const featuresIncluded = [
  "Unlimited PGs & buildings",
  "Bed, room & floor management",
  "Tenant profiles & history",
  "Rent, advance & dues tracking",
  "Upcoming vacancy forecasting",
  "Live dashboard & analytics",
  "Secure role-based access",
  "Data export anytime",
  "Email & priority support"
]

export default function PricingSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24">
      <div className="text-center mb-14">
        <div className="text-xs uppercase tracking-widest text-indigo-600 font-semibold">
          Simple pricing
        </div>
        <h2 className="text-4xl font-extrabold mt-3">
          One plan. Everything included.
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
          No feature limits. No hidden charges.  
          Just a complete PG management system at a fair price.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto rounded-3xl border-2 border-indigo-600 bg-indigo-50 p-8 shadow-xl"
      >
        {/* Price */}
        <div className="text-center">
          <div className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">
            Professional Plan
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-5xl font-extrabold">₹999</span>
            <span className="text-lg text-gray-600">/ month</span>
          </div>

          <div className="mt-2 text-sm text-indigo-700 font-medium">
            All features included • No limits
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {featuresIncluded.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 text-gray-700"
            >
              <span className="text-green-600 mt-1">✔</span>
              <span className="text-sm">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/signup"
            className="inline-block px-8 py-4 rounded-xl bg-indigo-600 text-white text-lg font-semibold hover:bg-indigo-700 shadow-lg"
          >
            Start managing your PG
          </Link>

          <div className="mt-4 text-sm text-gray-600">
            No credit card required 
          </div>
        </div>
      </motion.div>
    </section>
  )
}
