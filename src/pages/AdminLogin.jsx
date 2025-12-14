import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin(){
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    // very small mock auth: accept admin@admin.com / admin123
    if (email === 'admin@admin.com' && password === 'admin123') {
      try { localStorage.setItem('isAdmin', 'true'); localStorage.removeItem('isOwner') } catch {}
      navigate('/admin/dashboard')
    } else {
      setError('Invalid credentials. Try admin@admin.com / admin123')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border rounded-2xl shadow-lg p-6 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">A</div>
          <div>
            <div className="text-lg font-bold">Admin Console</div>
            <div className="text-sm text-gray-500">Sign in to manage records and analytics</div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@admin.com" className="w-full p-3 border rounded-md focus:ring focus:ring-indigo-100" required />

          <label className="block text-sm font-medium text-gray-600">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin123" type="password" className="w-full p-3 border rounded-md focus:ring focus:ring-indigo-100" required />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button type="submit" className="w-full py-3 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Sign in</button>
        </form>

        <div className="mt-6 text-xs text-gray-500">
          For demo: use <span className="font-medium">admin@admin.com</span> / <span className="font-medium">admin123</span>
        </div>
      </div>
    </div>
  )
}
