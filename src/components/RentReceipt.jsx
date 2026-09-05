import React from 'react'
import { ShieldCheck, CheckCircle2, IndianRupee } from 'lucide-react'

function getValidString(...vals) {
  for (const v of vals) {
    if (
      v &&
      typeof v === 'string' &&
      v.trim() !== '' &&
      v.trim() !== '—' &&
      v.trim() !== '-' &&
      v.trim() !== 'N/A' &&
      v.trim() !== 'null' &&
      v.trim() !== 'undefined'
    ) {
      return v.trim()
    }
  }
  return null
}

export default function RentReceipt({
  receipt,
  pg,
  owner,
  tenant,
  bed,
  billing,
}) {
  const pgName = getValidString(
    pg?.pgName,
    pg?.name,
    tenant?.pgName,
    bed?.pgName,
    typeof window !== 'undefined' ? localStorage.getItem('selectedPgName') : null,
    typeof window !== 'undefined' ? localStorage.getItem('businessName') : null,
    'Manage My PG'
  )

  const pgAddress = getValidString(
    pg?.address,
    pg?.fullAddress,
    pg?.pgAddress,
    tenant?.pgAddress,
    bed?.pgAddress,
    typeof window !== 'undefined' ? localStorage.getItem('pgAddress') : null,
    ''
  )

  const pgPhone = getValidString(
    pg?.phone,
    pg?.mobile,
    pg?.pgPhone,
    tenant?.pgPhone,
    bed?.pgPhone,
    ''
  )

  const ownerName = getValidString(
    owner?.name,
    owner?.ownerName,
    pg?.ownerName,
    tenant?.ownerName,
    bed?.ownerName,
    typeof window !== 'undefined' ? localStorage.getItem('fullName') : null,
    typeof window !== 'undefined' ? localStorage.getItem('username') : null,
    'Property Owner'
  )

  const amountPaid = Number(billing?.amount?.paid) || 0
  const periodFrom = billing?.period?.from ? new Date(billing.period.from).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
  const periodTo = billing?.period?.to ? new Date(billing.period.to).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
  const issuedDate = receipt?.issuedAt ? new Date(receipt.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden font-sans text-slate-900">
      {/* Header Section */}
      <div className="p-5 text-center border-b border-slate-100">
        <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Rent Receipt</div>
        <div className="text-lg font-black text-slate-900 uppercase tracking-tight mt-1">{pgName}</div>
        {pgAddress && <p className="text-[10px] font-medium text-slate-500 mt-1 max-w-xs mx-auto leading-tight">{pgAddress}</p>}
        {pgPhone && <p className="text-[9px] font-bold text-slate-400 mt-0.5">Contact: {pgPhone}</p>}
      </div>

      <div className="p-5 space-y-4">
        {/* Meta Bar */}
        <div className="flex items-center justify-end border-b border-slate-100 pb-2 text-xs font-bold">
          <div className="text-right">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Date of Issue</span>
            <span className="text-slate-900 text-[11px]">{issuedDate}</span>
          </div>
        </div>

        {/* Details List */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2 text-xs font-bold">
          <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Received From</span>
            <span className="text-slate-900 uppercase">{tenant?.name || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Room / Bed</span>
            <span className="text-indigo-600 font-black">{bed?.roomName || '-'} / {bed?.bedName || '-'}</span>
          </div>
          <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Billing Period</span>
            <span className="text-slate-800">{periodFrom} to {periodTo}</span>
          </div>
          <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Mode</span>
            <span className="text-slate-900 uppercase">{billing?.payment?.mode || 'CASH'}</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Status</span>
            <span className="text-emerald-600 font-black flex items-center gap-1"><CheckCircle2 size={12} /> PAID</span>
          </div>
        </div>

        {/* Compact Amount Box */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-2.5 px-4 text-center">
          <div className="text-xl font-black text-emerald-700 flex items-center justify-center gap-1">
            <IndianRupee size={18} strokeWidth={3} /> {amountPaid.toLocaleString('en-IN')}
          </div>
          {billing?.amount?.inWords && (
            <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider mt-0.5">({billing.amount.inWords})</p>
          )}
        </div>

        {billing?.remarks && (
          <div className="text-xs font-medium italic text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            Remarks: "{billing.remarks}"
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-center">
          <div>
            <div className="border-b border-slate-300 mb-1 mx-4" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Tenant Signature</span>
            <span className="text-xs font-black text-slate-800 uppercase">{tenant?.name || '—'}</span>
          </div>
          <div>
            <div className="border-b border-slate-300 mb-1 mx-4" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Authorized Signature</span>
            <span className="text-xs font-black text-slate-800 uppercase">{ownerName}</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center pt-1">
          * System Generated Rent Receipt • Manage My PG
        </div>
      </div>
    </div>
  )
}
