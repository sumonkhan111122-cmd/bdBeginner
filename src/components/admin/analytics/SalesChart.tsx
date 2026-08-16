import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import type { SalesSeriesBucket } from '@/services/analytics';
import { formatCurrency } from '@/lib/currency';

export function SalesChart({ data }: { data: SalesSeriesBucket[] }) {
  const chartData = data.map(d => ({
    date: new Date(d.bucket_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Sales: Number(d.paid_sales),
    Orders: Number(d.paid_orders)
  }));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-ink-100 p-5 shadow-soft flex flex-col items-center justify-center h-80">
        <p className="text-ink-500 font-medium">No sales data for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-ink-100 p-5 shadow-soft">
      <div className="mb-4">
        <h3 className="font-semibold text-ink-900">Sales Trend</h3>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(val) => `৳${val}`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <Tooltip 
              cursor={{ fill: '#F1F5F9' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value, name) => [
                name === 'Sales' ? formatCurrency(Number(value)) : String(value),
                String(name ?? '')
              ]}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar yAxisId="left" dataKey="Sales" fill="#0284C7" radius={[4, 4, 0, 0]} maxBarSize={50} />
            <Bar yAxisId="right" dataKey="Orders" fill="#38BDF8" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
