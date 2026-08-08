import { cn } from '@/lib/utils';
import { Link, type InertiaLinkProps } from '@inertiajs/react';

type ResponsiveNavLinkProps = InertiaLinkProps & {
    active?: boolean;
};

export default function ResponsiveNavLink({
    active = false,
    className,
    children,
    ...props
}: ResponsiveNavLinkProps): JSX.Element {
    return (
        <Link
            {...props}
            className={cn(
                'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                className,
            )}
        >
            {children}
        </Link>
    );
}
