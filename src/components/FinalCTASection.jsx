import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function FinalCTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl
                   bg-gradient-to-br from-indigo-600 to-purple-600
                   px-6 py-10 sm:px-10 sm:py-14
                   text-center text-white shadow-2xl"
      >
        {/* Soft background accent (visual only) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20
                     bg-[radial-gradient(circle_at_top,_white,_transparent_60%)]"
        />

        <h2 className="text-3xl sm:text-5xl font-extrabold">
          Ready to simplify your PG?
        </h2>

        <p className="mt-4 sm:mt-5 max-w-2xl mx-auto
                      text-indigo-100 text-base sm:text-lg">
          Stop managing your PG with spreadsheets, notebooks, and guesswork.
          Bring everything into one clear, reliable system.
        </p>

        <div className="mt-7 sm:mt-10 flex flex-col sm:flex-row
                        items-center justify-center gap-3 sm:gap-4">
          {/* Primary CTA */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <Link
              to="/signup"
              className="relative z-10 inline-block
                         px-7 py-3 sm:px-8 sm:py-4
                         rounded-xl bg-white text-indigo-700
                         text-base sm:text-lg font-semibold
                         hover:bg-indigo-50 shadow-lg"
            >
              Get started here
            </Link>
          </motion.div>

          {/* Secondary CTA */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <Link
              to="/signin"
              className="relative z-10 inline-block
                         px-7 py-3 sm:px-8 sm:py-4
                         rounded-xl border border-white/40
                         text-white text-base sm:text-lg font-semibold
                         hover:bg-white/10"
            >
              Sign in
            </Link>
          </motion.div>
        </div>

        <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-indigo-200">
          No credit card required • Cancel anytime
        </div>
      </motion.div>
    </section>
  )
}
