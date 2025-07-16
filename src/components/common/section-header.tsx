import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
}

export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
    return (
        <div className={cn("text-center mb-16", className)}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {title}
            </h2>
            {subtitle && (
                <p className="text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
                    {subtitle}
                </p>
            )}
        </div>
    );
} 