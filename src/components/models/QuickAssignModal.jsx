import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Search, User, Phone, CheckCircle2, Loader2 } from 'lucide-react'

const TenantAvatar = ({ name }) => {
  const initials = name
    ? name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?'

  const avatarColors = [
    'bg-orange-500', 'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-cyan-500'
  ]
  const avatarBg = avatarColors[Math.abs(name?.length || 0) % avatarColors.length]

  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-inner shrink-0 ${avatarBg}`}>
      {initials}
    </div>
  )
}

export default function QuickAssignModal({
  open,
  tenants,
  selectedTenant,
  onSelectTenant,
  onClose,
  onAssign,
}) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [assigning, setAssigning] = React.useState(false)

  if (!open) return null

  const filteredTenants = tenants.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.mobileNumber?.includes(searchTerm)
  )

  const handleAssign = async () => {
    setAssigning(true)
    try {
      await onAssign()
    } finally {
      setAssigning(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative border border-white/20 my-8"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-t-[2.5rem]" />

          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-20"
          >
            <X size={20} strokeWidth={3} />
          </button>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <UserPlus size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  Quick Assign
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  Link an existing tenant to this space
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={16} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="SEARCH BY NAME OR MOBILE..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredTenants.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <User size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No matching tenants found</p>
                </div>
              ) : (
                filteredTenants.map(t => {
                  const isSelected = selectedTenant?.id === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelectTenant(t)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 group ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-100/50'
                          : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <TenantAvatar name={t.name} />
                      <div className="flex-1 text-left min-w-0">
                        <p className={`text-[11px] font-black uppercase tracking-tight truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {t.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Phone size={10} className={isSelected ? 'text-indigo-400' : 'text-slate-400'} />
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}>
                            {t.mobileNumber}
                          </p>
                        </div>
                      </div>
                      <div className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-transparent'
                      }`}>
                        <CheckCircle2 size={14} strokeWidth={3} />
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 h-[46px] bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                disabled={!selectedTenant || assigning}
                onClick={handleAssign}
                className="flex-[2] h-[46px] bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-40 shadow-lg shadow-slate-100 active:scale-95 flex items-center justify-center gap-2"
              >
                {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus size={16} />}
                Confirm Assignment
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
