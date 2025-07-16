import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    subtitle: string;
    className?: string;
}

export function StatCard({ title, subtitle, className }: StatCardProps) {
    return (
        <div className={cn("text-center", className)}>
            <div className="text-3xl font-bold text-primary">
                {title}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {subtitle}
            </div>
        </div>
    );
} 