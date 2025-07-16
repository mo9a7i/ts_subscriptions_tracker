import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
    return (
        <section className="min-h-screen/2 py-20 flex justify-center items-center px-4 bg-neutral-950 text-white">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Your first step to financial awareness</h2>
                <p className="text-xl text-neutral-300 dark:text-neutral-500 mb-8 max-w-2xl mx-auto">
                    Start tracking today and discover which subscriptions are worth keeping. Smart sorting and auto-detection make it effortless.
                </p>
                <Link href="/dashboard">
                    <Button size="lg" className="text-lg px-8 bg-white text-neutral-950">
                        Begin Your Awareness Journey
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </Link>
            </div>
        </section>
    );
} 