import { Dialog, DialogContent, DialogTitle } from '@/Components/ui/dialog';
import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

type ModalProps = PropsWithChildren<{
    show: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    closeable?: boolean;
    onClose: () => void;
}>;

const maxWidthClasses: Record<
    NonNullable<ModalProps['maxWidth']>,
    string
> = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
};

export default function Modal({
    children,
    show,
    maxWidth = '2xl',
    closeable = true,
    onClose,
}: ModalProps): JSX.Element {
    const handleOpenChange = (isOpen: boolean): void => {
        if (!isOpen && closeable) {
            onClose();
        }
    };

    return (
        <Dialog open={show} onOpenChange={handleOpenChange}>
            <DialogContent
                className={cn('max-h-[90vh] overflow-y-auto', maxWidthClasses[maxWidth])}
                showCloseButton={closeable}
                onEscapeKeyDown={(event) => {
                    if (!closeable) {
                        event.preventDefault();
                    }
                }}
                onPointerDownOutside={(event) => {
                    if (!closeable) {
                        event.preventDefault();
                    }
                }}
            >
                <DialogTitle className="sr-only">Application dialog</DialogTitle>
                {children}
            </DialogContent>
        </Dialog>
    );
}
