import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-pink-50" />

      <div className="mx-auto max-w-7xl px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Audience tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
            Built for PG & Hostel Owners
          </div>

          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight">
            Manage your PG{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
              without spreadsheets
            </span>
            , confusion, or missed rent
          </h1>

          <p className="mt-5 text-gray-600 text-lg">
            Track beds, tenants, rent, payments, and upcoming vacancies from a
            single live dashboard — always accurate, always up to date.
          </p>

          <motion.div
            className="mt-7 flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link
              to="/signup"
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 text-center"
            >
              Get started free
            </Link>
            <Link
              to="/signin"
              className="px-6 py-3 rounded-xl border font-semibold hover:bg-gray-50 text-center"
            >
              Sign in
            </Link>
          </motion.div>

          {/* Trust micro-copy */}
          <motion.div
            className="mt-6 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            No credit card required • Secure data • Cancel anytime
          </motion.div>
        </motion.div>

        {/* Right dashboard preview */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="rounded-3xl border bg-white p-5 shadow-xl">
            <div className="grid grid-cols-2 gap-4">
              <DashboardTile title="Total beds" value="120" color="bg-blue-500" />
              <DashboardTile title="Filled beds" value="98" color="bg-green-500" />
              <DashboardTile title="Upcoming vacating" value="7" color="bg-yellow-400 text-black" />
              <DashboardTile title="Joins (this month)" value="14" color="bg-purple-500" />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

function DashboardTile({ title, value, color }) {
  return (
    <div className={`p-4 rounded-2xl text-white ${color}`}>
      <div className="text-xs opacity-90">{title}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  )
}
