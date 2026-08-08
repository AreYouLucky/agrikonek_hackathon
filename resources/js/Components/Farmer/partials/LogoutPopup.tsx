import { Link } from '@inertiajs/react';
import { LogOut, UserRound } from 'lucide-react';
import { type ReactElement, useState } from 'react';

export default function LogoutPopup(): ReactElement {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                aria-label="Open account menu"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                onClick={() => setIsOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
                <UserRound size={19} />
            </button>

            {isOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Close account menu"
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-40 cursor-default"
                    />

                    <div
                        role="menu"
                        className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 text-gray-800 shadow-xl shadow-gray-900/15"
                    >
                        <Link
                            href="/farmer/profile"
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-emerald-50 hover:text-[#03592f] focus:outline-none focus:ring-2 focus:ring-[#6ab225]/30"
                        >
                            <UserRound size={17} />
                            My profile
                        </Link>

                        <div className="my-1 border-t border-gray-100" />

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            role="menuitem"
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                        >
                            <LogOut size={17} />
                            Log out
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
