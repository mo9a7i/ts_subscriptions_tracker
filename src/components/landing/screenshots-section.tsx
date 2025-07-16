import Image from "next/image";
import { Check } from "lucide-react";
import { SectionHeader } from "@/components/common";
import { screenshots } from "@/data/screenshots";

export function ScreenshotsSection() {
    return (
        <section id="screenshots" className="min-h-screen py-20 bg-white dark:bg-neutral-900 flex justify-center items-center px-4">
            <div className="container mx-auto">
                <SectionHeader 
                    title="See SubTracker in action"
                    subtitle="Beautiful, intuitive interface designed for ease of use"
                />

                <div className="space-y-20">
                    {screenshots.map((screenshot, index) => (
                        <div 
                            key={index} 
                            className={`flex flex-col ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12`}
                        >
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-4">{screenshot.title}</h3>
                                <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-6">
                                    {screenshot.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>Easy to use interface</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="rounded-lg text-center justify-center items-center flex bg-neutral-50 dark:bg-neutral-900/30">
                                    <Image 
                                        src={screenshot.image || "/placeholder.svg"} 
                                        alt={screenshot.title} 
                                        style={{objectFit: "contain"}}
                                        width={1000}
                                        height={1000}
                                        className="rounded-lg max-h-96 bg-neutral-50 dark:bg-neutral-500/30 p-2"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
} 