import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    className?: string;
}

export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
    return (
        <Card className={cn(
            "border-0 shadow-sm bg-gradient-to-br from-neutral-950 to-neutral-900 text-white dark:bg-neutral-900/50",
            className
        )}>
            <CardHeader>
                <Icon className="w-10 h-10 text-primary mb-4" />
                <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-neutral-400 dark:text-neutral-400">{description}</p>
            </CardContent>
        </Card>
    );
} 