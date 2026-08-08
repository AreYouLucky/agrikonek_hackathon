import LogoutPopup from '@/Components/Farmer/partials/LogoutPopup';
import { Link, usePage } from '@inertiajs/react';
import { Sprout, UserRound } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';

type FarmersDashboardLayoutProps = {
    children: ReactNode;
    title?: string;
};

const navigation = [
    {
        label: 'New listing',
        href: '/create-agri-resource-listing',
        icon: Sprout,
    },
    {
        label: 'Profile',
        href: '/farmer/profile',
        icon: UserRound,
    },
];

export default function FarmersDashboardLayout({
    children,
    title = 'Farmer dashboard',
}: FarmersDashboardLayoutProps): ReactElement {
    const { url } = usePage();

    const isActive = (href: string): boolean => url.startsWith(href);

    return (
        <div className="min-h-screen bg-[#f4f8f3] text-gray-900">
            <header className="sticky top-0 z-40 border-b border-emerald-900/60 bg-emerald-950 text-white shadow-sm">
                <div className="mx-auto flex h-[68px] max-w-5xl items-center gap-3 px-4 sm:h-[72px] sm:px-6">
                    <Link
                        href="/create-agri-resource-listing"
                        aria-label="Go to farmer home"
                        className="flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                            <img
                                src="/storage/logos/logo-only.png"
                                alt=""
                                className="h-6 w-6 object-contain"
                            />
                        </span>

                        <span className="min-w-0">
                            <span className="block text-sm font-extrabold uppercase tracking-[0.12em] sm:text-base">
                                AgriKonek
                            </span>
                            <span className="block truncate text-[11px] font-medium text-emerald-200 sm:text-xs">
                                {title}
                            </span>
                        </span>
                    </Link>

                    <nav
                        aria-label="Farmer navigation"
                        className="ml-auto hidden items-center gap-2 md:flex"
                    >
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={active ? 'page' : undefined}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
                                        active
                                            ? 'bg-white text-emerald-950 shadow-sm'
                                            : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="ml-auto md:ml-2">
                        <LogoutPopup />
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl px-4 py-5 pb-28 sm:px-6 sm:py-7 md:pb-10">
                {children}
            </main>

            <nav
                aria-label="Farmer mobile navigation"
                className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden"
            >
                <div className="mx-auto grid h-[76px] max-w-md grid-cols-2 px-3 pb-[env(safe-area-inset-bottom)]">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={`group flex flex-col items-center justify-center gap-1 rounded-2xl text-xs transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#6ab225] ${
                                    active
                                        ? 'font-bold text-[#03592f]'
                                        : 'font-medium text-gray-400 hover:text-[#03592f]'
                                }`}
                            >
                                <span
                                    className={`flex h-9 w-14 items-center justify-center rounded-xl transition ${
                                        active
                                            ? 'bg-[#6ab225]/15 text-[#03592f]'
                                            : 'group-hover:bg-emerald-50'
                                    }`}
                                >
                                    <Icon
                                        size={20}
                                        strokeWidth={active ? 2.5 : 2}
                                    />
                                </span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
