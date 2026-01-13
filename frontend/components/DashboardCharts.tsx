'use client'

import dynamic from 'next/dynamic'

const CashFlowChart = dynamic(() => import('./CashFlowChart'), {
    loading: () => <div className="glass-effect rounded-2xl p-4 md:p-6 h-[300px] animate-pulse" />,
    ssr: false
})

const CategoryPieChart = dynamic(() => import('./CategoryPieChart'), {
    loading: () => <div className="glass-effect rounded-2xl p-4 md:p-6 h-[300px] animate-pulse" />,
    ssr: false
})

interface DashboardChartsProps {
    cashFlowData: any[]
    expensesByCategoryData: any[]
}

export default function DashboardCharts({ cashFlowData, expensesByCategoryData }: DashboardChartsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            <CashFlowChart data={cashFlowData} />
            <CategoryPieChart data={expensesByCategoryData} />
        </div>
    )
}
