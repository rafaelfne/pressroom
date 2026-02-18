import Link from 'next/link';
import { APP_NAME } from '@pressroom/shared';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-20 text-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
            P
          </div>
          <h1 className="text-5xl font-bold tracking-tight">{APP_NAME}</h1>
        </div>
        <p className="max-w-xl text-xl text-muted-foreground">
          The modern report generation platform. Design beautiful reports with a
          visual editor, bind live data, and export pixel-perfect PDFs.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Criar conta</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            Everything you need for professional reports
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-background p-6">
              <h3 className="mb-2 text-lg font-semibold">Visual Editor</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop components to build report layouts. No coding
                required — see your changes in real time.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-6">
              <h3 className="mb-2 text-lg font-semibold">Data Binding</h3>
              <p className="text-sm text-muted-foreground">
                Connect live data sources to your templates with powerful
                expression bindings. Tables, charts, and KPIs update
                automatically.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-6">
              <h3 className="mb-2 text-lg font-semibold">PDF Generation</h3>
              <p className="text-sm text-muted-foreground">
                Export pixel-perfect PDFs via API or one-click download.
                Consistent rendering across all formats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </footer>
    </main>
  );
}
