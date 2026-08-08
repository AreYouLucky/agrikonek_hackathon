import type { ReactNode } from 'react';
import { Factory, MapPin, Sprout } from 'lucide-react';

type AuthLayoutProps = {
    children: ReactNode;
    title?: string;
    description?: string;
};

export default function AuthLayout({
    children,
    title = 'Welcome to AgriKonek',
    description = 'Turning agricultural surplus into new opportunities.',
}: AuthLayoutProps) {
    return (
        <main className="min-h-screen bg-stone-50">
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Branding */}
                <section className="relative hidden items-center justify-center overflow-hidden bg-emerald-950 px-12 lg:flex">
                    <div
                        aria-hidden="true"
                        className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
                    />

                    <div className="relative z-10 w-full max-w-xl">
                        <div className="flex justify-center">
                            <img
                                src="/storage/logos/logo.png"
                                alt="AgriKonek"
                                className="h-64 w-auto object-contain xl:h-72"
                            />
                        </div>

                        <p className="mt-2 text-center text-lg leading-7 text-emerald-100/70">
                            Turn agricultural surplus into new opportunities.
                        </p>

                        <div className="mt-10 grid grid-cols-3 border-t border-emerald-400/20 pt-6">
                            <Feature
                                icon={<Sprout className="h-5 w-5" />}
                                label="Farmers"
                            />

                            <Feature
                                icon={<Factory className="h-5 w-5" />}
                                label="Processors"
                            />

                            <Feature
                                icon={<MapPin className="h-5 w-5" />}
                                label="LGUs"
                            />
                        </div>
                    </div>
                </section>

                {/* Authentication */}
                <section className="relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="mb-10 flex justify-center lg:hidden">
                            <img
                                src="/storage/logos/logo.png"
                                alt="AgriKonek"
                                className="h-24 w-auto object-contain"
                            />
                        </div>

                        <div className="mb-8">
                            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
                                {title}
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-stone-500">
                                {description}
                            </p>
                        </div>

                        {children}

                        <p className="mt-10 text-center text-xs text-stone-400">
                            &copy; {new Date().getFullYear()} AgriKonek. All
                            rights reserved.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

function Feature({
    icon,
    label,
}: {
    icon: ReactNode;
    label: string;
}) {
    return (
        <div className="flex items-center justify-center gap-2 text-emerald-100">
            <span className="text-emerald-300">{icon}</span>

            <span className="text-sm font-medium">
                {label}
            </span>
        </div>
    );
}