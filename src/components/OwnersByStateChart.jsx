import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function OwnersByStateChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="h-[250px] flex items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" />
        <YAxis type="category" dataKey="state" />
        <Tooltip />
        <Bar dataKey="count" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  )
}
