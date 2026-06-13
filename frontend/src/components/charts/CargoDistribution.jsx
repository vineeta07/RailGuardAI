import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COLORS } from '../../utils/constants';

export default function CargoDistribution({ data }) {
  if (!data || !data.by_type) return null;

  const chartData = Object.entries(data.by_type).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          animationDuration={800}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS.chartColors[i % COLORS.chartColors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
