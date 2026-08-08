import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
    label: string;
    href: string;
    isActive: boolean;
    icon: LucideIcon;
};

type NavLinkProps = {
    items: NavItem[];
    isCollapsed?: boolean;
    onClose?: () => void;
};

export default function NavLink({
    items,
    isCollapsed = false,
    onClose,
}: NavLinkProps): JSX.Element {
    return (
        <nav className="space-y-1" aria-label="Main navigation">
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
                            isCollapsed &&
                                'lg:justify-center lg:px-0',
                            item.isActive
                                ? 'bg-white text-[#0b5ed7] shadow-sm'
                                : 'text-blue-100 hover:bg-white/10 hover:text-white',
                        )}
                        onClick={onClose}
                        title={isCollapsed ? item.label : undefined}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className={cn(isCollapsed && 'lg:sr-only')}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
