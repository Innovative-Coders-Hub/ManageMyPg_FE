import React, { memo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-2.5 px-3.5 rounded-xl shadow-xl border border-slate-800 text-xs">
        <p className="font-black uppercase tracking-wider text-[10px] text-emerald-300 mb-0.5">{label}</p>
        <p className="font-bold text-white text-xs">{payload[0].value} Registered Partners</p>
      </div>
    )
  }
  return null
}

const OwnersByStateChart = memo(function OwnersByStateChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-xs font-black text-slate-400 uppercase tracking-widest">
        No State Data Available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
          axisLine={{ stroke: '#CBD5E1' }}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="state"
          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
          axisLine={{ stroke: '#CBD5E1' }}
          tickLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }} />
        <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
})

export default OwnersByStateChart
