import React, { memo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-2.5 px-3.5 rounded-xl shadow-xl border border-slate-800 text-xs">
        <p className="font-black uppercase tracking-wider text-[10px] text-indigo-300 mb-0.5">{label}</p>
        <p className="font-bold text-white text-xs">{payload[0].value} Registered Partners</p>
      </div>
    )
  }
  return null
}

const OwnersByCityChart = memo(function OwnersByCityChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-xs font-black text-slate-400 uppercase tracking-widest">
        No City Data Available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="city"
          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
          axisLine={{ stroke: '#CBD5E1' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
          axisLine={{ stroke: '#CBD5E1' }}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }} />
        <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
})

export default OwnersByCityChart
