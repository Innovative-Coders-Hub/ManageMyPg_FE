import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Show a brief loader on route changes so users see feedback for navigation
export default function useRouteLoader({ minVisible = 300 } = {}) {
  const { pathname, search } = useLocation()
  const [loading, setLoading] = useState(false)

  // Helper to get path without volatile search params like 'q'
  const getSignificantPath = (p, s) => {
    const sp = new URLSearchParams(s)
    sp.delete('q')
    const searchStr = sp.toString()
    return p + (searchStr ? '?' + searchStr : '')
  }

  const prevRef = useRef(getSignificantPath(pathname, search))
  const timeoutRef = useRef(null)

  useEffect(() => {
    const significantPath = getSignificantPath(pathname, search)

    if (significantPath !== prevRef.current) {
      prevRef.current = significantPath
      setLoading(true)
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setLoading(false), minVisible)
    }
    return () => clearTimeout(timeoutRef.current)
  }, [pathname, search, minVisible])

  return loading
}
