import { CreditCard, Bell, Tag, Shield, Smartphone, BarChart3, ArrowUpDown, Zap, LucideIcon } from "lucide-react";

export interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
}

export const features: Feature[] = [
    {
        icon: CreditCard,
        title: "Track All Subscriptions",
        description: "Keep track of all your recurring payments in one centralized dashboard with visual organization.",
    },
    {
        icon: ArrowUpDown,
        title: "Smart Sorting",
        description: "Sort by next payment, name, or amount with one-click ascending/descending options in a streamlined dropdown.",
    },
    {
        icon: Zap,
        title: "Auto Icon Detection",
        description: "Service icons are automatically fetched and color-matched to create a beautiful, organized view.",
    },
    {
        icon: Tag,
        title: "Smart Labeling",
        description: "Organize subscriptions with custom labels and filter by categories for better cost awareness.",
    },
    {
        icon: BarChart3,
        title: "Spending Analytics",
        description: "Understand your spending patterns with detailed cost breakdowns to identify expensive subscriptions.",
    },
    {
        icon: Shield,
        title: "Privacy First",
        description: "Your data stays in your browser. Optional cloud sync when you need it, with zero tracking.",
    },
]; 