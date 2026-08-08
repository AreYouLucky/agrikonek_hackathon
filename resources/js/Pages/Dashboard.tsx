import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Head } from '@inertiajs/react';
import { BarChart3, FileText, MessageCircleMore } from 'lucide-react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="truncate text-base font-semibold text-slate-700">
                        Dashboard
                    </h1>
                    <p className="hidden text-xs text-slate-500 sm:block">
                        Facebook Page Insights overview
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                            Analytics workspace
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Review page activity and understand how your content
                            is performing.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-blue-100 shadow-sm">
                            <CardHeader className="pb-3">
                                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                    <BarChart3 className="h-5 w-5" />
                                </span>
                                <CardTitle className="text-base">
                                    Page performance
                                </CardTitle>
                                <CardDescription>
                                    Track reach, views, and engagement across
                                    monitored pages.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-blue-100 shadow-sm">
                            <CardHeader className="pb-3">
                                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                    <FileText className="h-5 w-5" />
                                </span>
                                <CardTitle className="text-base">
                                    Content analytics
                                </CardTitle>
                                <CardDescription>
                                    Compare posts and identify content that
                                    connects with audiences.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-blue-100 shadow-sm">
                            <CardHeader className="pb-3">
                                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                    <MessageCircleMore className="h-5 w-5" />
                                </span>
                                <CardTitle className="text-base">
                                    Audience response
                                </CardTitle>
                                <CardDescription>
                                    Understand reactions, comments, and sharing
                                    behavior.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>

                    <Card className="mt-6 border-blue-100 shadow-sm">
                        <CardContent className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                                <BarChart3 className="h-6 w-6" />
                            </span>
                            <h3 className="mt-4 font-semibold text-slate-900">
                                Your insights will appear here
                            </h3>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Analytics summaries and recent page activity
                                will populate this workspace as data becomes
                                available.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
