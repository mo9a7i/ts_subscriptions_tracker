import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import MyHeader from "@/components/layout/header";
import { StatCard } from "@/components/common";

export function HeroSection() {
    return (
        <section className="h-screen">
            <MyHeader />
            <div className="flex flex-col justify-center items-center h-full">
                <div className="container mx-auto text-center">
                    <Badge variant="secondary" className="mb-4">
                        ✨ Enhanced with smart sorting & auto-detection
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
                        Awareness is the 
                        <br />
                        First Step to Control
                    </h1>
                    <p className="text-xl text-neutral-500 dark:text-neutral-400 mb-4 max-w-2xl mx-auto">
                        Track and organize all your recurring payments with intelligent sorting and auto-detection. 
                    </p>
                    <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto font-medium">
                        When you know what you're paying for, you can decide what's worth keeping and what's too expensive.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard">
                            <Button size="lg" className="text-lg px-8">
                                Start Tracking Now
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                        <StatCard title="100%" subtitle="Privacy Focused" />
                        <StatCard title="Auto" subtitle="Icon Detection" />
                        <StatCard title="Smart" subtitle="Sorting Options" />
                    </div>
                </div>
            </div>
        </section>
    );
} 