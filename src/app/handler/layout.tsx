import Header from "@/components/layout/header";

export default function HandlerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      <main className="container mx-auto w-full px-4 py-8 [&>.stack-scope]:mx-auto">
        {children}
      </main>
    </div>
  );
}
