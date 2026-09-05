import React, { createContext, useContext, useState, useEffect } from 'react'

const AppScopeContext = createContext()

export function AppScopeProvider({ children }) {
  // Active PG Scope (for Property-scoped pages)
  const [activePgId, setActivePgIdState] = useState(() => {
    return sessionStorage.getItem('activePgId') || localStorage.getItem('selectedPgId') || ''
  })

  // Detail scopes for entity pages
  const [activeTenantId, setActiveTenantIdState] = useState(() => {
    return sessionStorage.getItem('activeTenantId') || ''
  })

  const [activeBedId, setActiveBedIdState] = useState(() => {
    return sessionStorage.getItem('activeBedId') || ''
  })

  const [activePgDetailId, setActivePgDetailIdState] = useState(() => {
    return sessionStorage.getItem('activePgDetailId') || ''
  })

  const [activeAdminOwnerId, setActiveAdminOwnerIdState] = useState(() => {
    return sessionStorage.getItem('activeAdminOwnerId') || ''
  })

  const setActivePgId = (id) => {
    if (!id) return
    setActivePgIdState(id)
    sessionStorage.setItem('activePgId', id)
    localStorage.setItem('selectedPgId', id)
  }

  const setActiveTenantId = (id) => {
    const val = id || ''
    setActiveTenantIdState(val)
    if (val) sessionStorage.setItem('activeTenantId', val)
    else sessionStorage.removeItem('activeTenantId')
  }

  const setActiveBedId = (id) => {
    const val = id || ''
    setActiveBedIdState(val)
    if (val) sessionStorage.setItem('activeBedId', val)
    else sessionStorage.removeItem('activeBedId')
  }

  const setActivePgDetailId = (id) => {
    const val = id || ''
    setActivePgDetailIdState(val)
    if (val) sessionStorage.setItem('activePgDetailId', val)
    else sessionStorage.removeItem('activePgDetailId')
  }

  const setActiveAdminOwnerId = (id) => {
    const val = id || ''
    setActiveAdminOwnerIdState(val)
    if (val) sessionStorage.setItem('activeAdminOwnerId', val)
    else sessionStorage.removeItem('activeAdminOwnerId')
  }

  const clearDetailScope = () => {
    setActiveTenantIdState('')
    setActiveBedIdState('')
    setActivePgDetailIdState('')
    setActiveAdminOwnerIdState('')
    sessionStorage.removeItem('activeTenantId')
    sessionStorage.removeItem('activeBedId')
    sessionStorage.removeItem('activePgDetailId')
    sessionStorage.removeItem('activeAdminOwnerId')
  }

  return (
    <AppScopeContext.Provider
      value={{
        activePgId,
        setActivePgId,
        activeTenantId,
        setActiveTenantId,
        activeBedId,
        setActiveBedId,
        activePgDetailId,
        setActivePgDetailId,
        activeAdminOwnerId,
        setActiveAdminOwnerId,
        clearDetailScope
      }}
    >
      {children}
    </AppScopeContext.Provider>
  )
}

export function useAppScope() {
  const context = useContext(AppScopeContext)
  if (!context) {
    throw new Error('useAppScope must be used within an AppScopeProvider')
  }
  return context
}
