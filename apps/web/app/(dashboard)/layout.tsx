import Link from 'next/link';
import { FileText, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-16 border-r bg-background md:w-60">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center px-4 md:justify-start">
            <Link
              href="/templates"
              className="flex items-center gap-2 font-semibold"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                P
              </div>
              <span className="hidden md:inline">Pressroom</span>
            </Link>
          </div>

          <Separator />

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2">
            <Link
              href="/templates"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <FileText className="h-5 w-5" />
              <span className="hidden md:inline">Templates</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-5 w-5" />
              <span className="hidden md:inline">Settings</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-16 flex-1 overflow-auto md:ml-60">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
