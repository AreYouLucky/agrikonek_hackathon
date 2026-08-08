// resources/js/layouts/FarmersDashboardLayout.tsx

import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    Plus,
    ReceiptText,
    UserRound,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface FarmersDashboardLayoutProps {
    children: ReactNode;
    title?: string;
}

const navigation = [
    {
        label: 'Home',
        href: '/dashboard',
        icon: Home,
    },
    {
        label: 'Transactions',
        href: '/transactions',
        icon: ReceiptText,
    },
    {
        label: 'Create',
        href: '/resource-listings/create',
        icon: Plus,
        primary: true,
    },
    {
        label: 'Profile',
        href: '/profile',
        icon: UserRound,
    },
];

export default function FarmersDashboardLayout({
    children,
    title = 'Dashboard',
}: FarmersDashboardLayoutProps) {
    const { url } = usePage();

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return url === '/dashboard';
        }

        return url.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-[#f7faf7]">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#03592f]">
                            <span className="text-lg font-bold text-white">
                                A
                            </span>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-[#6ab225]">
                                AgriKonek
                            </p>

                            <h1 className="text-base font-bold text-[#03592f]">
                                {title}
                            </h1>
                        </div>
                    </div>

                    <Link
                        href="/profile"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#03592f]/5 text-[#03592f] transition hover:bg-[#03592f]/10"
                    >
                        <UserRound size={20} />
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-5xl px-4 py-6 pb-28">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
                <div className="mx-auto grid h-[76px] max-w-5xl grid-cols-4 px-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        if (item.primary) {
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="relative flex flex-col items-center justify-end pb-2"
                                >
                                    <div className="absolute -top-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#f2bd11] text-[#03592f] shadow-lg transition hover:scale-105">
                                        <Icon
                                            size={26}
                                            strokeWidth={2.5}
                                        />
                                    </div>

                                    <span className="text-xs font-semibold text-[#03592f]">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 rounded-xl transition ${
                                    active
                                        ? 'text-[#03592f]'
                                        : 'text-gray-400 hover:text-[#6ab225]'
                                }`}
                            >
                                <div
                                    className={`flex h-9 w-12 items-center justify-center rounded-xl transition ${
                                        active
                                            ? 'bg-[#03592f]/10'
                                            : 'bg-transparent'
                                    }`}
                                >
                                    <Icon
                                        size={21}
                                        strokeWidth={active ? 2.5 : 2}
                                    />
                                </div>

                                <span
                                    className={`text-[11px] ${
                                        active
                                            ? 'font-bold'
                                            : 'font-medium'
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}