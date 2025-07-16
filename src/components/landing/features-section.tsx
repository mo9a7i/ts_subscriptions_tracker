import { SectionHeader, FeatureCard } from "@/components/common";
import { features } from "@/data/features";

export function FeaturesSection() {
    return (
        <section id="features" className="h-screen flex justify-center items-center px-4 bg-neutral-900 text-white dark:text-neutral-500">
            <div className="container mx-auto">
                <SectionHeader 
                    title="Smart tools for subscription awareness"
                    subtitle="Powerful features designed to help you understand and optimize your recurring payments"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
} 