'use client'

import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

interface CategoryPieChartProps {
    data: any[]
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316']

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
    return (
        <div className="card-premium p-6">
            <h2 className="text-lg font-bold text-white mb-6">Gastos por Categoría</h2>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => window.innerWidth >= 640 ? `${name}` : `${(percent * 100).toFixed(0)}%`}
                            outerRadius={window.innerWidth >= 640 ? 100 : 80}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#18181b', // Surface
                                border: '1px solid #27272a', // Border
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any) => [`$${value.toFixed(2)}`, '']}
                            labelStyle={{ color: '#a1a1aa' }}
                        />
                        <Legend
                            iconType="circle"
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[250px] flex items-center justify-center">
                    <p className="text-muted">No hay gastos registrados</p>
                </div>
            )}
        </div>
    )
}
