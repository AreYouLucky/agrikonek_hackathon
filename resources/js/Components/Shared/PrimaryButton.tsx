import { Button } from '@/Components/ui/button';
import type { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className,
    type = 'submit',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
    return <Button type={type} className={className} {...props} />;
}
