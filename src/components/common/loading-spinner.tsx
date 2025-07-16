import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    text?: string;
}

const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
};

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center">
            <div 
                className={cn(
                    "animate-spin rounded-full border-b-2 border-primary",
                    sizeClasses[size],
                    className
                )}
            />
            {text && (
                <p className="text-neutral-500 dark:text-neutral-400 mt-4">
                    {text}
                </p>
            )}
        </div>
    );
} 