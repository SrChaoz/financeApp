import Navigation from '@/components/Navigation'
import PageTransition from '@/components/PageTransition'

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navigation />
            <PageTransition>
                <main className="pb-20 md:pb-0 md:ml-64">
                    {children}
                </main>
            </PageTransition>
        </>
    )
}
