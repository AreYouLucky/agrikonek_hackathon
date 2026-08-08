import { Label } from '@/Components/ui/label';
import type { ComponentProps } from 'react';

type InputLabelProps = ComponentProps<typeof Label> & {
    value?: string;
};

export default function InputLabel({
    value,
    children,
    ...props
}: InputLabelProps): JSX.Element {
    return <Label {...props}>{value ?? children}</Label>;
}
