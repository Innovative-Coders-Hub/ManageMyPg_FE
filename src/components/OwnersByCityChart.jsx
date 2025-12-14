import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export default function OwnersByCityChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="h-[250px] flex items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="city" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  )
}
