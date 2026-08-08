import { Input } from '@/Components/ui/input';
import {
    forwardRef,
    useEffect,
    useRef,
    type ComponentProps,
} from 'react';

type TextInputProps = ComponentProps<typeof Input> & {
    isFocused?: boolean;
};

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ isFocused = false, ...props }, forwardedRef) => {
        const localRef = useRef<HTMLInputElement | null>(null);

        useEffect(() => {
            if (isFocused) {
                localRef.current?.focus();
            }
        }, [isFocused]);

        const setRefs = (element: HTMLInputElement | null): void => {
            localRef.current = element;

            if (typeof forwardedRef === 'function') {
                forwardedRef(element);
            } else if (forwardedRef) {
                forwardedRef.current = element;
            }
        };

        return <Input ref={setRefs} {...props} />;
    },
);
TextInput.displayName = 'TextInput';

export default TextInput;
