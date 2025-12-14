import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const navigate = useNavigate()
  const submit = (e) => {
    e.preventDefault()
    // simple demo: navigate to home
    try { localStorage.setItem('isOwner', 'true'); localStorage.removeItem('isAdmin') } catch {}
    navigate('/home')
  }
  return (
    <div className="max-w-md mx-auto mt-12 card">
      <h2 className="text-2xl font-semibold mb-4">Sign in to ManegeMyPg</h2>
      <form onSubmit={submit} className="space-y-3">
        <input required placeholder="Email" className="w-full p-2 border rounded"/>
        <input required placeholder="Password" type="password" className="w-full p-2 border rounded"/>
        <button className="w-full bg-blue-600 text-white p-2 rounded">Sign in</button>
      </form>
    </div>
  )
}
