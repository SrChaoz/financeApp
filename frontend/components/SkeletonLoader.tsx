export default function SkeletonLoader() {
    return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="glass-effect rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-slate-700 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-700 rounded w-1/3" />
                            <div className="h-3 bg-slate-700 rounded w-1/4" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-slate-700 rounded w-full" />
                        <div className="h-3 bg-slate-700 rounded w-5/6" />
                    </div>
                </div>
            ))}
        </div>
    )
}
