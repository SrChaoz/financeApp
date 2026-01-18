'use client'

import dynamic from 'next/dynamic'

const CashFlowChart = dynamic(() => import('./CashFlowChart'), {
    loading: () => <div className="card-premium h-[330px] animate-pulse bg-zinc-900/50" />,
    ssr: false
})

const CategoryPieChart = dynamic(() => import('./CategoryPieChart'), {
    loading: () => <div className="card-premium h-[330px] animate-pulse bg-zinc-900/50" />,
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
