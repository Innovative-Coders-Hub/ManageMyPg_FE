import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  UserPlus,
  Search,
  User,
  Phone,
  CheckCircle2,
  Loader2,
  Bed as BedIcon
} from 'lucide-react'
import { getFullImageUrl } from '../../api/api'
import { getUnassignedTenants } from '../../api/ownerAuth'

const TenantAvatar = ({ name, profileImageUrl }) => {
  const [imgError, setImgError] = useState(false)
  const initials = name
    ? name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?'

  const fullUrl = getFullImageUrl(profileImageUrl)

  if (fullUrl && !imgError) {
    return (
      <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-xs">
        <img
          src={fullUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
      {initials}
    </div>
  )
}

export default function QuickAssignModal({
  open,
  bed,
  tenants: propTenants,
  selectedTenant: externalSelectedTenant,
  onSelectTenant,
  onClose,
  onAssign,
  onAssignSuccess,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [internalSelectedTenant, setInternalSelectedTenant] = useState(null)
  const [assigning, setAssigning] = useState(false)
  const [fetchedTenants, setFetchedTenants] = useState([])
  const [loadingTenants, setLoadingTenants] = useState(false)

  const tenants = propTenants && propTenants.length > 0 ? propTenants : fetchedTenants
  const selectedTenant = externalSelectedTenant || internalSelectedTenant

  useEffect(() => {
    if (!open) {
      setSearchTerm('')
      setInternalSelectedTenant(null)
    } else if (bed?.pgId && (!propTenants || propTenants.length === 0)) {
      setLoadingTenants(true)
      getUnassignedTenants(bed.pgId)
        .then(setFetchedTenants)
        .catch(() => setFetchedTenants([]))
        .finally(() => setLoadingTenants(false))
    }
  }, [open, bed?.pgId, propTenants])

  if (!open) return null

  const filteredTenants = tenants.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.mobileNumber?.includes(searchTerm)
  )

  const handleSelect = (t) => {
    if (onSelectTenant) {
      onSelectTenant(t)
    } else {
      setInternalSelectedTenant(t)
    }
  }

  const handleAssign = async () => {
    if (!selectedTenant) return
    setAssigning(true)
    try {
      if (onAssignSuccess) {
        await onAssignSuccess(selectedTenant.id, selectedTenant)
      } else if (onAssign) {
        await onAssign(selectedTenant)
      }
    } finally {
      setAssigning(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Right Slide-Over Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 relative z-10"
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header Bar */}
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <UserPlus size={20} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">
                      Quick Assign Resident
                    </h3>
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-0.5 truncate">
                      {bed ? `Bed ${bed.bedName} • Room ${bed.roomName}` : 'Select resident to link'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
                  title="Close Drawer"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Sticky Search & Filter Toolbar */}
              <div className="p-4 bg-slate-50 border-b border-slate-200/80 shrink-0">
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <Search size={15} />
                  </div>
                  <input
                    type="text"
                    placeholder="SEARCH BY RESIDENT NAME OR PHONE..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-black uppercase tracking-tight text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs placeholder:text-slate-400 placeholder:font-bold"
                  />
                </div>
                <div className="flex items-center justify-between mt-2.5 px-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {filteredTenants.length} Resident{filteredTenants.length !== 1 ? 's' : ''} Available
                  </span>
                  {selectedTenant && (
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      1 Selected
                    </span>
                  )}
                </div>
              </div>

              {/* Scrollable Resident Directory */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar bg-slate-50/30">
                {filteredTenants.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200 p-6 my-auto">
                    <User size={36} className="mx-auto text-slate-300 mb-3" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">No Residents Found</h4>
                    <p className="text-[10px] font-medium text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                      No matching unassigned residents were found in directory.
                    </p>
                  </div>
                ) : (
                  filteredTenants.map(t => {
                    const isSelected = selectedTenant?.id === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleSelect(t)}
                        className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-150 text-left cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/90 border-indigo-500 shadow-sm'
                            : 'bg-white border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/80 shadow-xs'
                        }`}
                      >
                        <TenantAvatar
                          name={t.name}
                          profileImageUrl={t.profileImageUrl || t.photoUrl || t.imageUrl || t.tenantProfileImageUrl}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-black uppercase tracking-tight truncate ${isSelected ? 'text-indigo-950 font-black' : 'text-slate-900'}`}>
                            {t.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Phone size={11} className={isSelected ? 'text-indigo-500' : 'text-slate-400'} />
                            <span className={`text-[9.5px] font-bold uppercase tracking-widest ${isSelected ? 'text-indigo-600 font-black' : 'text-slate-400'}`}>
                              {t.mobileNumber}
                            </span>
                          </div>
                        </div>
                        <div className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-transparent'
                        }`}>
                          <CheckCircle2 size={14} strokeWidth={2.5} />
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

              {/* Drawer Fixed Footer Bar */}
              <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-3 shadow-lg">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedTenant || assigning}
                  onClick={handleAssign}
                  className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-40 shadow-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  {assigning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus size={15} />
                  )}
                  Confirm Assignment
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
