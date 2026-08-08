import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    Info,
    ListChecks,
    LogOut,
    Menu,
    MessagesSquare,
    PackageSearch,
    X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

type ProcessorLayoutsProps = {
    children: ReactNode;
};

const navigation = [
    {
        label: 'Home',
        href: route('processors.dashboard'),
        icon: Home,
        match: '/processors/dashboard',
    },
    {
        label: 'My Demands',
        href: route('processors.agri-resources.my-demands'),
        icon: ListChecks,
        match: '/processors/agri-resources/my-demands',
    },
    {
        label: 'Smart Demand',
        href: route('processors.smart-demands'),
        icon: PackageSearch,
        match: '/processors/smart-demands',
    },
    {
        label: 'Messages',
        href: route('processors.transactions'),
        icon: MessagesSquare,
        match: '/processors/transactions',
    },
    {
        label: 'About Us',
        href: route('processors.about-us'),
        icon: Info,
        match: '/processors/about-us',
    },
];

export default function ProcessorLayouts({
    children,
}: ProcessorLayoutsProps) {
    const { url } = usePage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (match: string): boolean => {
        if (match.startsWith('#')) {
            return false;
        }

        return url === match || url.startsWith(`${match}/`);
    };

    return (
        <div className="min-h-screen bg-[#f7fbf3]">
            <header className="sticky top-0 z-40 border-b border-[#6ab225]/20 bg-white/95 shadow-sm backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('processors.dashboard')}
                        className="flex min-w-0 items-center gap-3"
                    >
                       <img src='/storage/logos/logo-only.png' height={50} width={50}/>
                        <span className="min-w-0">
                            <span className="block text-xs font-bold uppercase tracking-wide text-[#6ab225]">
                                AgriKonek
                            </span>
                            <span className="block truncate text-base font-bold text-[#03592f]">
                                Processor
                            </span>
                        </span>
                    </Link>

                    <nav
                        className="hidden items-center gap-1 md:flex"
                        aria-label="Processor navigation"
                    >
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.match);

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                                        active
                                            ? 'bg-[#03592f] text-white'
                                            : 'text-stone-600 hover:bg-[#6ab225]/10 hover:text-[#03592f]'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}

                        <Link
                            href={route('logout')}
                            className="ml-2 inline-flex h-10 items-center gap-2 rounded-xl bg-[#f2bd11] px-4 text-sm font-bold text-[#03592f] transition hover:bg-[#ffd04a]"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Link>
                    </nav>

                    <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#03592f] transition hover:bg-[#6ab225]/10 md:hidden"
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen((open) => !open)}
                    >
                        {isMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {isMenuOpen ? (
                    <div className="border-t border-[#6ab225]/20 bg-white px-4 py-3 shadow-sm md:hidden">
                        <nav
                            className="mx-auto flex max-w-7xl flex-col gap-2"
                            aria-label="Mobile processor navigation"
                        >
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.match);

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                                            active
                                                ? 'bg-[#03592f] text-white'
                                                : 'text-stone-600 hover:bg-[#6ab225]/10 hover:text-[#03592f]'
                                        }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}

                            <Link
                                href={route('logout')}
                                className="flex h-11 items-center gap-3 rounded-xl bg-[#f2bd11] px-3 text-sm font-bold text-[#03592f]"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Link>
                        </nav>
                    </div>
                ) : null}
            </header>

            {children}
        </div>
    );
}
