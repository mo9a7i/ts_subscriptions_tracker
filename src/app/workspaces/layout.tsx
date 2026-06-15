import Header from '@/components/layout/header'

export default function WorkspacesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      {children}
    </div>
  )
}
