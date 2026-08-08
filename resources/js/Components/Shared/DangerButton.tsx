import { Button } from '@/Components/ui/button';
import type { ButtonHTMLAttributes } from 'react';

export default function DangerButton({
    className,
    type = 'button',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
    return (
        <Button
            type={type}
            variant="destructive"
            className={className}
            {...props}
        />
    );
}
