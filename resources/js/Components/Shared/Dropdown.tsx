import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Link, type InertiaLinkProps } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

const Dropdown = ({ children }: PropsWithChildren): JSX.Element => (
    <DropdownMenu>{children}</DropdownMenu>
);

const Trigger = ({ children }: PropsWithChildren): JSX.Element => (
    <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
);

type ContentProps = PropsWithChildren<{
    align?: 'left' | 'right';
    width?: '48';
    contentClasses?: string;
}>;

const Content = ({
    align = 'right',
    width = '48',
    contentClasses,
    children,
}: ContentProps): JSX.Element => (
    <DropdownMenuContent
        align={align === 'left' ? 'start' : 'end'}
        className={cn(width === '48' && 'w-48', contentClasses)}
    >
        {children}
    </DropdownMenuContent>
);

const DropdownLink = ({
    className,
    children,
    ...props
}: InertiaLinkProps): JSX.Element => (
    <DropdownMenuItem asChild>
        <Link className={cn('w-full cursor-pointer', className)} {...props}>
            {children}
        </Link>
    </DropdownMenuItem>
);

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
