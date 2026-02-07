import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../api/adminAuth'

export default function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
     const response = await adminLogin({ email, password })

      if (!response?.success || !response?.data?.accessToken) {
        throw new Error(response?.message || 'Invalid login response')
      }

      const { accessToken, refreshToken, expiresIn } = response.data

      localStorage.setItem('admin_jwt', accessToken)
      localStorage.setItem('admin_refresh_token', refreshToken)
      localStorage.setItem('admin_token_expiry', Date.now() + expiresIn)
      localStorage.setItem('role', 'ADMIN')
      localStorage.setItem('isAdmin', 'true') // Required for RequireAdmin guard
     navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid email or password'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border rounded-2xl shadow-lg p-6 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <div className="text-lg font-bold">Admin Console</div>
            <div className="text-sm text-gray-500">
              Sign in to manage records and analytics
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@admin.com"
              className="w-full p-3 border rounded-md focus:ring focus:ring-indigo-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border rounded-md focus:ring focus:ring-indigo-100"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* <div className="mt-6 text-xs text-gray-500 text-center">
          Demo credentials:
          <span className="font-medium"> admin@admin.com</span> /
          <span className="font-medium"> admin123</span>
        </div> */}
      </div>
    </div>
  )
}
