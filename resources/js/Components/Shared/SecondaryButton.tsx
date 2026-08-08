import { Button } from '@/Components/ui/button';
import type { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
    className,
    type = 'button',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
    return (
        <Button
            type={type}
            variant="outline"
            className={className}
            {...props}
        />
    );
}
