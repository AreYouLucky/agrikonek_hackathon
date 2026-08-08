import { Link } from '@inertiajs/react';
import { BarChart3, LogOut } from 'lucide-react';
import { type ReactNode } from 'react';

type LguLayoutProps = {
    children: ReactNode;
};

export default function LguLayout({ children }: LguLayoutProps) {
    return (
        <div className="min-h-screen bg-[#f7fbf3]">
            <header className="sticky top-0 z-40 border-b border-[#6ab225]/20 bg-white/95 shadow-sm backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('lgu.dashboard')}
                        className="flex min-w-0 items-center gap-3"
                    >
                        <img
                            src="/storage/logos/logo-only.png"
                            alt="AgriKonek"
                            className="h-11 w-11 object-contain"
                        />
                        <span className="min-w-0">
                            <span className="block text-xs font-bold uppercase tracking-wide text-[#6ab225]">
                                AgriKonek
                            </span>
                            <span className="block truncate text-base font-bold text-[#03592f]">
                                LGU Command Center
                            </span>
                        </span>
                    </Link>

                    <nav className="flex items-center gap-2">
                        <Link
                            href={route('lgu.dashboard')}
                            className="hidden h-10 items-center gap-2 rounded-xl bg-[#03592f] px-4 text-sm font-semibold text-white sm:inline-flex"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link
                            href={route('logout')}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#f2bd11] px-4 text-sm font-bold text-[#03592f] transition hover:bg-[#ffd04a]"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Link>
                    </nav>
                </div>
            </header>

            <main>{children}</main>
        </div>
    );
}
