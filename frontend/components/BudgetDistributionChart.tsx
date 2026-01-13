'use client'

import { PieChart as RechartsP, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface BudgetDistributionChartProps {
    chartData: any[]
}

export default function BudgetDistributionChart({ chartData }: BudgetDistributionChartProps) {
    if (!chartData || chartData.length === 0 || !chartData.some(d => d.value > 0)) {
        return (
            <div className="h-[250px] flex items-center justify-center">
                <p className="text-slate-400">No hay gastos registrados aún</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <RechartsP>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => window.innerWidth >= 640 ? `${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={window.innerWidth >= 640 ? 90 : 70}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px'
                    }}
                    formatter={(value: any) => `$${value.toFixed(2)}`}
                />
                <Legend />
            </RechartsP>
        </ResponsiveContainer>
    )
}
