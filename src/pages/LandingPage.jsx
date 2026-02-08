import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SuccessPopup from "../components/SuccessPopup";
import { registerOwner } from "../api/ownerAuth";
import { ownerLogin } from "../api/ownerAuth";
/* ---------------- Shared primitives still in this file ---------------- */

function Footer() {
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          {/* Inline brand (Logo component removed; App.jsx owns the header) */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow" />
            <span className="font-extrabold text-xl tracking-tight">ManegeMyPg</span>
          </Link>
          <p className="mt-3 text-gray-600">
            All-in-one PG/Hostel management: beds, tenants, payments, and vacating forecasts—at a glance.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-3">Product</div>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#features" className="hover:text-indigo-600">Features</a></li>
            <li><a href="#pricing" className="hover:text-indigo-600">Pricing</a></li>
            <li><a href="#faq" className="hover:text-indigo-600">FAQ</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Company</div>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#" className="hover:text-indigo-600">About</a></li>
            <li><a href="#" className="hover:text-indigo-600">Blog</a></li>
            <li><a href="#" className="hover:text-indigo-600">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Get Started</div>
          <p className="text-gray-600 mb-3">Sign up and manage your PG in minutes.</p>
          <Link
            to="/signup"
            className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow"
          >
            Create account
          </Link>
        </div>
      </div>
      <div className="py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ManegeMyPg. All rights reserved.
      </div>
    </footer>
  );
}

function SectionTitle({ eyebrow, title, subtitle, id }) {
  return (
    <div id={id} className="text-center mb-8">
      {eyebrow && (
        <div className="text-xs uppercase tracking-widest text-indigo-600 font-semibold">
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">{title}</h2>
      {subtitle && <p className="mt-2 text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl border bg-white hover:shadow-lg transition">
      <div className="mb-3 h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
        {icon}
      </div>
      <div className="font-semibold">{title}</div>
      <p className="mt-1 text-gray-600 text-sm">{desc}</p>
    </div>
  );
}

/* ---------------- Pages ---------------- */

function LandingPage() {
  return (
    <main>
      {/* Header is now global from App.jsx — removed <Navbar /> here */}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-pink-50" />
        <div className="mx-auto max-w-7xl px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
              New • Vacancy forecasting added
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight">
              Manage your PG like a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
                pro
              </span>
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              Real-time beds, tenants, upcoming vacations, payments and more — all in a single clean dashboard.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/signup"
                className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 text-center"
              >
                Get started free
              </Link>
              <Link
                to="/signin"
                className="px-5 py-3 rounded-xl border font-semibold hover:bg-gray-50 text-center"
              >
                Sign in
              </Link>
            </div>
            {/* Promo strip */}
            <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
              <span className="px-2 py-1 rounded bg-green-50 text-green-700 font-semibold">Promo</span>
              <span>
                Launch offer: <strong>2 months free</strong> on annual plan.
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl border bg-white p-4 shadow-xl">
              {/* dashboard preview mock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl text-white bg-blue-500">
                  <div className="text-xs opacity-90">Total beds</div>
                  <div className="text-2xl font-extrabold mt-1">120</div>
                </div>
                <div className="p-4 rounded-2xl text-white bg-green-500">
                  <div className="text-xs opacity-90">Filled beds</div>
                  <div className="text-2xl font-extrabold mt-1">98</div>
                </div>
                <div className="p-4 rounded-2xl bg-yellow-400 text-black">
                  <div className="text-xs">Upcoming vacating</div>
                  <div className="text-2xl font-extrabold mt-1">7</div>
                </div>
                <div className="p-4 rounded-2xl text-white bg-purple-500">
                  <div className="text-xs opacity-90">Joins (this month)</div>
                  <div className="text-2xl font-extrabold mt-1">14</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16" id="features">
        <SectionTitle
          eyebrow="Why ManegeMyPg"
          title="Everything you need to run your PG"
          subtitle="No spreadsheets. No chaos. Just clear, reliable operations."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard icon={<span>🛏️</span>} title="Bed & Room Management" desc="Track total, filled, and available beds with smart filters and assignments." />
          <FeatureCard icon={<span>📅</span>} title="Vacating Forecast" desc="See upcoming move-outs to plan marketing and occupancy." />
          <FeatureCard icon={<span>👥</span>} title="Tenant CRM" desc="Store profiles, IDs, and contracts with reminders and notes." />
          <FeatureCard icon={<span>💸</span>} title="Payments & Dues" desc="Record rent, deposits, and auto-calculate pending balances." />
          <FeatureCard icon={<span>📈</span>} title="Analytics" desc="Tiles and trends that show what's changing at a glance." />
          <FeatureCard icon={<span>🔒</span>} title="Secure" desc="Role-based access, audit logs, and modern authentication." />
        </div>
      </section>

      {/* Pricing (promo) */}
      <section className="mx-auto max-w-7xl px-4 py-16" id="pricing">
        <SectionTitle eyebrow="Simple pricing" title="Start free, grow anytime" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-2xl bg-white">
            <div className="text-sm font-semibold text-indigo-600">Starter</div>
            <div className="text-3xl font-extrabold mt-2">
              ₹0<span className="text-base font-semibold text-gray-500"> /month</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>Up to 1 PG</li>
              <li>Basic dashboards</li>
              <li>Email support</li>
            </ul>
            <Link to="/signup" className="mt-6 inline-block w-full text-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
              Get started
            </Link>
          </div>
          <div className="p-6 border-2 border-indigo-600 rounded-2xl bg-indigo-50">
            <div className="text-sm font-semibold text-indigo-700">Professional</div>
            <div className="text-3xl font-extrabold mt-2">
              ₹999<span className="text-base font-semibold text-gray-600"> /month</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-700 list-disc list-inside">
              <li>Unlimited PGs</li>
              <li>Vacating forecast</li>
              <li>Priority support</li>
            </ul>
            <Link to="/signup" className="mt-6 inline-block w-full text-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
              Choose plan
            </Link>
            <div className="mt-2 text-xs text-indigo-700">Launch offer: 2 months free on annual billing</div>
          </div>
          <div className="p-6 border rounded-2xl bg-white">
            <div className="text-sm font-semibold text-indigo-600">Business</div>
            <div className="text-3xl font-extrabold mt-2">Custom</div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>API & integrations</li>
              <li>Roles & SSO</li>
              <li>Dedicated manager</li>
            </ul>
            <a href="#" className="mt-6 inline-block w-full text-center px-4 py-2 rounded-xl border font-semibold hover:bg-gray-50">
              Talk to us
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-16" id="faq">
        <SectionTitle eyebrow="Questions" title="Frequently asked" />
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-6 border rounded-2xl bg-white">
            <div className="font-semibold">Can I import my existing data?</div>
            <p className="mt-2 text-gray-600">Yes, CSV import for beds, rooms and tenants is available. We can help you migrate.</p>
          </div>
          <div className="p-6 border rounded-2xl bg-white">
            <div className="font-semibold">Is there a free plan?</div>
            <p className="mt-2 text-gray-600">Starter is free forever for 1 PG. Upgrade anytime.</p>
          </div>
          <div className="p-6 border rounded-2xl bg-white">
            <div className="font-semibold">How do payments work?</div>
            <p className="mt-2 text-gray-600">Record collections and track dues. Online payments can be added via Razorpay/Stripe.</p>
          </div>
          <div className="p-6 border rounded-2xl bg-white">
            <div className="font-semibold">Can I self-host?</div>
            <p className="mt-2 text-gray-600">Yes, the app runs as a standard React + Spring Boot setup. Docker images available on request.</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ---------------- Shared form bits ---------------- */

function Input({
      label,
      type = "text",
      value,
      onChange,
      placeholder,
      numeric = false,
      maxLength
    }) {
      const [show, setShow] = useState(false);
      const isPassword = type === "password";

      function handleChange(e) {
        let val = e.target.value;

        if (numeric) {
          val = val.replace(/\D/g, ""); // remove non-digits
        }

        if (maxLength) {
          val = val.slice(0, maxLength);
        }

        onChange(val);
      }

    return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>

      <div className="relative mt-1">
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          inputMode={numeric ? "numeric" : undefined}
          className="w-full rounded-xl border px-3 py-2 pr-10 outline-none
                     focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-indigo-600"
          >
            {show ? "🙈" : "👁️"}
          </button>
        )}
      </div>
    </label>
  );
}



function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg border">
        <div className="text-center">
          {/* Inline brand (Logo component removed) */}
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow" />
            <span className="font-extrabold text-xl tracking-tight">ManegeMyPg</span>
          </Link>
          <h1 className="mt-4 text-2xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-1 text-gray-600 text-sm">{subtitle}</p>}
        </div>
        <div className="mt-6 space-y-4">{children}</div>
        <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>
      </div>
    </div>
  );
}

/* ---------------- Auth pages ---------------- */

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
          const data = await ownerLogin({ email, password })

          // Normalize booleans (very important)
          const isBlocked = data.isBlocked === true || data.isBlocked === 'true'
          const isApproved = data.isApproved === true || data.isApproved === 'true'
          const role = data.role // "OWNER" | "TENANT"
          const businessName = data.pgName || ''

          // 1️⃣ Blocked
          if (isBlocked) {
            setError("Your account has been blocked. Please contact support.")
            return
          }

          // 2️⃣ Not approved (only for OWNER)
          if (role === 'OWNER' && !isApproved) {
            setError("Your account is under verification. Please wait until admin approval.")
            return
          }

          // 3️⃣ Store session
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          localStorage.setItem('tokenType', data.tokenType || 'Bearer')
          localStorage.setItem('role', role)

          if (role === 'OWNER') {
            localStorage.setItem('isOwner', 'true')
            localStorage.setItem('isApproved', isApproved)
            localStorage.setItem('isBlocked', isBlocked)
            localStorage.setItem('businessName', businessName)


            // Owner profile completion
            const hasAddress = Boolean(data.isAddress)
          // const addressData = Boolean(data.address)

            if (hasAddress) {
              navigate('/home', { replace: true })
            } else {
              navigate('/ownerProfile', { replace: true })
            }
          }

          if (role === 'TENANT') {
            localStorage.setItem('tenantId', data.id)
            localStorage.setItem('isTenant', 'true')
            // Tenant always goes to dashboard
            navigate('/tenant/dashboard', { replace: true })
          }

        } catch (err) {
          if (err.status === 401) {
            setError("Invalid email or password")
          } else if (err.status === 403) {
            setError("Your account has been blocked. Please contact support.")
          } else {
            setError(err.message || "Something went wrong. Please try again.")
          }
        } finally {
          setLoading(false)
        }
      }


  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          disabled={loading}
          className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div className="text-center text-sm text-gray-600 mt-2">
        <Link to="/forgot" className="hover:text-indigo-600">
          Forgot password?
        </Link>
      </div>
      <div className="mt-6 text-center text-sm text-gray-600">
        New here?{" "}
        <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
          Create an account
        </Link>
      </div>
    </AuthCard>
  );
}

export function SignUpPage() {
  const navigate = useNavigate();
  const [username, setUserName] = useState("");
  const [fullName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [apiError, setApiError] = useState("");
      useEffect(() => {
        if (showSuccess) {
          const timer = setTimeout(() => {
            setShowSuccess(false);
            // optional cleanup
            setUserName("");
            setName("");
            setEmail("");
            setPhone("");
            setPassword("");
            setConfirmPassword("");
            setPasswordMatch(false);
            setPasswordError("");
            setAgree(false);

            navigate("/signin");
          }, 30000);
          return () => clearTimeout(timer);
        }
      }, [showSuccess, navigate]);

     async function handleSubmit(e) {
          e.preventDefault();
          setApiError("");

          if (!agree) {
            setApiError("Please accept Terms & Privacy");
            return;
          }
          if (!passwordMatch) return;
          setLoading(true);
          try {
            const payload = {
              username,
              fullName,
              email,
              phone,
              password
            };
            const response = await registerOwner(payload);
            // Registration failed
            if (!response?.success) {
             setApiError(response?.message ?? "Registration failed");
              return;
            }
            // ✅ Registration success (approved=false by default)
            setShowSuccess(true);
          } catch (err) {
            setApiError(err?.response?.data?.message ||"Something went wrong. Please try again.");
          } finally {
            setLoading(false);
          }
        }
  return (
    <AuthCard  title="Create your account" subtitle="Start managing your PG in minutes"
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/signin" className="text-indigo-600 font-semibold hover:underline">
            Sign in
          </Link>
        </span>
      }>
      <form onSubmit={handleSubmit} className="space-y-4">
         <Input label="UserName" value={username} onChange={setUserName} placeholder="VENKATESH" />
        <Input label="Full name" value={fullName} onChange={setName} placeholder="Venkatest Chowdary" />
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Input label="Phone" type="tel"   value={phone} onChange={setPhone} placeholder="9876543210" numeric maxLength={10} />
        {/* <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Minimum 12 characters" /> */}
        <Input label="Password" type="password" value={password}
            onChange={(value) => {
              setPassword(value);
              setPasswordMatch(false);
              setPasswordError("");
            }}
            placeholder="Minimum 12 characters"/>
        <Input label="Confirm Password" type="password" value={confirmPassword}
            onChange={(value) => {setConfirmPassword(value);
              if (!value) { setPasswordError("");  setPasswordMatch(false);return;}
              if (password === value) {setPasswordError("");setPasswordMatch(true);} else {setPasswordError("Passwords do not match");setPasswordMatch(false);}
            }}  placeholder="Minimum 12 characters"/>
         {passwordError && (<div className="text-red-600 text-sm">{passwordError}</div>)}
         {passwordMatch && (<div className="text-green-600 text-sm font-medium">✓ Passwords matched</div>)}
        {/* <Input label="Full Addresss" value={address} onChange={setAddress} placeholder="Enter Full address" /> */}
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="rounded border-gray-300" />
          <span>
            I agree to the <a className="text-indigo-600 hover:underline" href="#">Terms</a> and{" "}
            <a className="text-indigo-600 hover:underline" href="#">Privacy Policy</a>.
          </span>
        </label>
        <button
          disabled={loading || !passwordMatch}
          className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold
                    hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
        {apiError && (
            <div className="text-red-600 text-sm text-center">
              {apiError}
            </div>
          )}

      </form>
      {showSuccess && <SuccessPopup />}
    </AuthCard>
  );
}

/* Default export for the landing page */
export default LandingPage;
