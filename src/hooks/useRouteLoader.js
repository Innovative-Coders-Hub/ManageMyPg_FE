import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Show a brief loader on route changes so users see feedback for navigation
export default function useRouteLoader({ minVisible = 300 } = {}) {
  const { pathname, search } = useLocation()
  const [loading, setLoading] = useState(false)
  const prevRef = useRef(pathname + search)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const current = pathname + search
    if (current !== prevRef.current) {
      prevRef.current = current
      // show loader
      setLoading(true)
      // ensure it's visible for at least `minVisible` ms
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setLoading(false), minVisible)
    }
    return () => clearTimeout(timeoutRef.current)
  }, [pathname, search, minVisible])

  return loading
}
