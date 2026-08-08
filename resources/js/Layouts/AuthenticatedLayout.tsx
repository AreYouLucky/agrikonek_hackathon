import AppSidebar from '@/Components/AppSidebar';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { X, Menu } from 'lucide-react';
import { useState, type PropsWithChildren, type ReactNode } from 'react';

type AuthenticatedLayoutProps = PropsWithChildren<{
    header?: ReactNode;
}>;

export default function AuthenticatedLayout({
    header,
    children,
}: AuthenticatedLayoutProps): JSX.Element {
    const user = usePage().props.auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <AppSidebar
                user={user}
                isOpen={isSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div
                className={cn(
                    'min-h-screen transition-[padding] duration-200 ease-out',
                    isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60',
                )}
            >
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-blue-100 bg-white/95 px-2 shadow-sm shadow-blue-950/[0.03] backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:px-6 lg:px-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-blue-700 hover:bg-blue-50 hover:text-blue-800 lg:hidden"
                        aria-label="Open sidebar"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hidden shrink-0 text-blue-700 hover:bg-blue-50 hover:text-blue-800 lg:inline-flex"
                        aria-label={
                            isSidebarCollapsed
                                ? 'Expand sidebar'
                                : 'Collapse sidebar'
                        }
                        aria-pressed={isSidebarCollapsed}
                        onClick={() =>
                            setIsSidebarCollapsed(
                                (isCollapsed) => !isCollapsed,
                            )
                        }
                    >
                        {isSidebarCollapsed ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>

                    {header && <div className="min-w-0 flex-1">{header}</div>}
                </header>

                <main className="min-h-[calc(100vh-4rem)] bg-white">{children}</main>
            </div>
        </div>
    );
}
