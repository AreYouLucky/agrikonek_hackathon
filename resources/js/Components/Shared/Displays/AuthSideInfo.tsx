import { IoLogoFacebook } from "react-icons/io";
export default function AuthSideInfo() {
    return (
        <section className="relative hidden overflow-hidden bg-[#0866ff] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20 xl:py-14">
            <div
                aria-hidden="true"
                className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-48 -right-24 h-[32rem] w-[32rem] rounded-full bg-blue-950/25 blur-3xl"
            />
            <div className="relative z-10 max-w-2xl py-12">
                <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-blue-100 flex items-center gap-2">
                    <IoLogoFacebook className="text-2xl text-white rounded-lg" />  Facebook Page Insights analyzer
                </p>
                <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl xl:leading-[1.12]">
                    Discover what audiences analytics across pages.
                </h1>
                <p className="mt-6 text-base leading-7 text-blue-100 xl:text-lg">
                    Search any topic to find related posts across multiple pages, then analyze
                    their reach, engagement, reactions, comments, and overall performance.
                </p>

                <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-sm xl:p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-blue-100">
                                Total engagement
                            </p>
                            <p className="mt-1 text-2xl font-bold">24,860</p>
                        </div>
                        <span className="rounded-full bg-yellow-400/80 px-3 py-1 text-xs font-semibold text-emerald-800">
                            +18.4%
                        </span>
                    </div>

                    <div
                        aria-label="Engagement trend preview"
                        className="flex h-32 items-end gap-2"
                        role="img"
                    >
                        {[42, 58, 48, 72, 64, 86, 76, 94, 82, 100, 91, 112].map(
                            (height, index) => (
                                <span
                                    key={`${height}-${index}`}
                                    className="flex-1 rounded-t-md bg-white/80 transition-colors hover:bg-yellow-300"
                                    style={{ height: `${height}px` }}
                                />
                            ),
                        )}
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/15 pt-5 text-sm">
                        <div>
                            <p className="text-blue-100">Reach</p>
                            <p className="mt-1 font-semibold">82.4K</p>
                        </div>
                        <div>
                            <p className="text-blue-100">Reactions</p>
                            <p className="mt-1 font-semibold">12.8K</p>
                        </div>
                        <div>
                            <p className="text-blue-100">Shares</p>
                            <p className="mt-1 font-semibold">3.2K</p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="relative z-10 text-sm text-blue-200">
                © 2026 DOST-STII. All rights reserved.
            </p>
        </section>
    )
}
