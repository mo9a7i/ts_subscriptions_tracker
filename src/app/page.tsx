import { CreditCard, Github, SquareRoundCorner, BugIcon, Heart } from "lucide-react";
import { 
    HeroSection, 
    FeaturesSection, 
    ScreenshotsSection, 
    TestimonialsSection, 
    CtaSection 
} from "@/components/landing";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <HeroSection />
            <FeaturesSection />
            <ScreenshotsSection />
            <TestimonialsSection />
            <CtaSection />

            {/* Footer */}
            <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12 px-4">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Brand */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                <span className="font-semibold">SubTracker</span>
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Privacy-first subscription tracking. Your data stays with you.
                            </p>
                        </div>

                        {/* Product */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm">Product</h4>
                            <div className="space-y-2">
                                <Link href="/dashboard" className="block text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                                    Dashboard
                                </Link>
                                <Link href="/#features" className="block text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                                    Features
                                </Link>
                                <Link href="/#screenshots" className="block text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                                    Screenshots
                                </Link>
                            </div>
                        </div>

                        {/* Support & Community */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm">Support</h4>
                            <div className="space-y-2">
                                <a href="https://github.com/mo9a7i/ts_subscriptions_tracker" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                                    <Github className="w-4 h-4" />
                                    Contribute
                                </a>
                                <a href="https://subscriptionlister.userjot.com/board/features" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                                    <SquareRoundCorner className="w-4 h-4" />
                                    Request Features
                                </a>
                                <a href="https://subscriptionlister.userjot.com/board/bugs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                                    <BugIcon className="w-4 h-4" />
                                    Report Bugs
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                © 2024 SubTracker. Built with privacy in mind.
                            </div>

                            {/* Made with love */}
                            <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                                <span>Made with</span>
                                <Heart className="w-4 h-4 text-red-500" />
                                <span>for privacy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
