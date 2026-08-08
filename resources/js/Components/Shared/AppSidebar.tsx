import Dropdown from '@/Components/Dropdown';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BarChart3,
    ChevronUp,
    LayoutDashboard,
    LogOut,
    NotebookText,
    StickyNotes,
    X,
    UserRound,
    type LucideIcon,
    Users,
    SquareActivity,
} from 'lucide-react';

type AppSidebarProps = {
    user: User;
    isOpen: boolean;
    isCollapsed: boolean;
    onClose: () => void;
};

type SidebarItem = {
    label: string;
    href: string;
    isActive: boolean;
    icon: LucideIcon;
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

export default function AppSidebar({
    user,
    isOpen,
    isCollapsed,
    onClose,
}: AppSidebarProps): JSX.Element {
    const items: SidebarItem[] = [
        {
            label: 'Pages',
            href: route('profile.edit'),
            isActive: Boolean(route().current('profile.edit')),
            icon: NotebookText,
        },
        {
            label: 'Posts',
            href: route('profile.edit'),
            isActive: Boolean(route().current('profile.edit')),
            icon: StickyNotes,
        },
    ];

    const management: SidebarItem[] = [
        {
            label: 'Users',
            href: route('profile.edit'),
            isActive: Boolean(route().current('profile.edit')),
            icon: Users,
        },
        {
            label: 'Activities',
            href: route('profile.edit'),
            isActive: Boolean(route().current('profile.edit')),
            icon: SquareActivity,
        },
    ];

    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
                    aria-label="Close sidebar"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-blue-700 bg-[#0b5ed7] text-white shadow-xl shadow-blue-950/10 transition-[width,transform] duration-200 ease-out lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                    isCollapsed ? 'lg:w-16' : 'lg:w-60',
                )}
                aria-label="Dashboard sidebar"
            >
                <div
                    className={cn(
                        'flex h-16 shrink-0 items-center justify-between border-b border-white/15 px-4',
                        isCollapsed && 'lg:justify-center lg:px-2',
                    )}
                >
                    <Link
                        href={route('dashboard')}
                        className="flex min-w-0 items-center justify-end gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        onClick={onClose}
                    >
                        {
                            isCollapsed ? (
                                <img src="/storage/images/logos/stii.png" alt="STII Logo" className="h-8 w-8" />
                            ) : (
                                <img src="/storage/images/logos/stii_dark.png" alt="STII Logo" className="h-11" />
                            )
                        }
                    </Link>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-blue-100 hover:bg-white/10 hover:text-white lg:hidden"
                        aria-label="Close sidebar"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div
                    className={cn(
                        'flex-1 overflow-y-auto px-3 py-4',
                        isCollapsed && 'lg:px-2',
                    )}
                >
                    <Link
                        href={route('dashboard')}
                        className={cn(
                            'hover:scale-105 duration-200 flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
                            isCollapsed &&
                            'lg:justify-center lg:px-0',
                            Boolean(route().current('dashboard'))
                                ? 'bg-white text-[#0b5ed7] shadow-sm'
                                : 'text-blue-100 hover:bg-white/10 hover:text-white',
                        )}
                        onClick={onClose}
                        title={
                            isCollapsed ? 'Dashboard' : undefined
                        }
                    >
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        <span
                            className={cn(
                                isCollapsed && 'lg:sr-only',
                            )}
                        >
                            Dashboard
                        </span>
                    </Link>
                    <p
                        className={cn(
                            'mb-2 mt-5 px-3 text-[10px] font-medium uppercase tracking-wider text-blue-200',
                            isCollapsed && 'lg:sr-only',
                        )}
                    >
                        Workspace
                    </p>
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
                                    title={
                                        isCollapsed ? item.label : undefined
                                    }
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span
                                        className={cn(
                                            isCollapsed && 'lg:sr-only',
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                    <p
                        className={cn(
                            'mb-4 mt-5 px-3 text-[10px] font-medium uppercase tracking-wider text-blue-200',
                            isCollapsed && 'lg:sr-only',
                        )}
                    >
                        Management
                    </p>
                    <nav className="space-y-1" aria-label="Main navigation">
                        {management.map((item) => {
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
                                    title={
                                        isCollapsed ? item.label : undefined
                                    }
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span
                                        className={cn(
                                            isCollapsed && 'lg:sr-only',
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div
                    className={cn(
                        'border-t border-white/15 p-3',
                        isCollapsed && 'lg:p-2',
                    )}
                >
                    <Dropdown>
                        <Dropdown.Trigger>
                            <Button
                                variant="ghost"
                                className={cn(
                                    'h-auto w-full justify-start gap-3 px-2 py-2 text-left',
                                    'text-white hover:bg-white/10 hover:text-white',
                                    isCollapsed &&
                                    'lg:justify-center lg:px-0',
                                )}
                                aria-label="Open account menu"
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-sm font-semibold text-white ring-1 ring-white/20">
                                    {getInitials(user.name)}
                                </span>
                                <span
                                    className={cn(
                                        'min-w-0 flex-1',
                                        isCollapsed && 'lg:hidden',
                                    )}
                                >
                                    <span className="block truncate text-sm font-medium text-white">
                                        {user.name}
                                    </span>
                                    <span className="block truncate text-xs font-normal text-blue-100">
                                        {user.email}
                                    </span>
                                </span>
                                <ChevronUp
                                    className={cn(
                                        'h-4 w-4 shrink-0 text-blue-200',
                                        isCollapsed && 'lg:hidden',
                                    )}
                                />
                            </Button>
                        </Dropdown.Trigger>

                        <Dropdown.Content align="left" contentClasses="w-56">
                            <Dropdown.Link href={route('profile.edit')}>
                                <UserRound className="mr-2 h-4 w-4" />
                                Profile
                            </Dropdown.Link>
                            <Dropdown.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </aside>
        </>
    );
}
