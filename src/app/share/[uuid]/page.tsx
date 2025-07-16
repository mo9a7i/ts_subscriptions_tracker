"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSharedSubscriptions, getSharedWorkspaceName } from "@/lib/workspace-db";
import { SubscriptionList } from "@/components/subscription-lister";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowDown, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import type { Subscription, SortOption } from "@/types";

// This page uses dynamic routing and should not be statically generated
export const dynamic = 'force-dynamic';

// Validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Call-to-action component
function CreateYourOwnCTA() {
    return (
        <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Your Own Subscription Tracker</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Track your subscriptions, set payment reminders, and manage your recurring expenses effortlessly.
            </p>
            <Button asChild size="lg">
                <Link href="/dashboard">
                    Get Started Free
                    <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
            </Button>
        </div>
    );
}

export default function ShareWorkspace() {
    const params = useParams();
    const sharingUUID = params.uuid as string;
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("nextPayment-asc");
    const [workspaceName, setWorkspaceName] = useState<string>("");

    useEffect(() => {
        // Validate UUID
        if (!isValidUUID(sharingUUID)) {
            setError("Invalid sharing link");
            setIsLoading(false);
            return;
        }

        loadSharedData();
    }, [sharingUUID]);

    const loadSharedData = async () => {
        try {
            // Load shared subscriptions directly using the view (no workspace ID exposure)
            const subs = await getSharedSubscriptions(sharingUUID);
            
            if (subs.length === 0) {
                // Try to get workspace name even if no subscriptions
                const name = await getSharedWorkspaceName(sharingUUID);
                if (!name) {
                    setError("Sharing link not found or has expired");
                    setIsLoading(false);
                    return;
                }
                setWorkspaceName(name);
            } else {
                // Get workspace name from the shared data
                const name = await getSharedWorkspaceName(sharingUUID);
                if (name) setWorkspaceName(name);
            }
            
            setSubscriptions(subs);
        } catch (error) {
            console.error("Failed to load shared workspace:", error);
            setError("Failed to load shared workspace. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Sort subscriptions
    const sortedSubscriptions = [...subscriptions].sort((a, b) => {
        const [field, order] = sortBy.split('-') as [string, 'asc' | 'desc'];
        let comparison = 0;
        
        switch (field) {
            case "nextPayment":
                comparison = new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime();
                break;
            case "name":
                comparison = a.name.localeCompare(b.name);
                break;
            case "amount":
                const amountA = a.currency === "SAR" ? a.amount : a.amount * 3.75;
                const amountB = b.currency === "SAR" ? b.amount : b.amount * 3.75;
                comparison = amountA - amountB;
                break;
        }
        
        return order === "asc" ? comparison : -comparison;
    });

    // Filter subscriptions
    const filteredSubscriptions = selectedLabels.length > 0 
        ? sortedSubscriptions.filter((sub) => sub.labels.some((label) => selectedLabels.includes(label))) 
        : sortedSubscriptions;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner text="Loading shared workspace..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Sharing Link Error</h1>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button asChild>
                        <Link href="/dashboard">Create Your Own Tracker</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6">
                {/* Header */}
                <header className="flex flex-col lg:flex-row gap-2 lg:gap-6 justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">{workspaceName}</h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            View this subscription tracker shared with you
                        </p>
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        <ThemeToggle />
                    </div>
                </header>

                <main className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* No sidebar for sharing - full width */}
                    <div className="lg:col-span-4">
                        <div className="flex flex-col lg:flex-row gap-2 lg:gap-6 justify-between mb-4">
                            <h2 className="text-xl font-semibold">
                                Subscriptions ({subscriptions.length})
                            </h2>
                            <div className="flex justify-between lg:justify-end items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="nextPayment-asc">Next Payment (Ascending)</SelectItem>
                                            <SelectItem value="nextPayment-desc">Next Payment (Descending)</SelectItem>
                                            <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                                            <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                                            <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                                            <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <SubscriptionList 
                            subscriptions={filteredSubscriptions} 
                            onUpdate={() => {}} 
                            selectedLabels={selectedLabels} 
                            sortBy={sortBy} 
                            workspaceDB={null as any}
                            readonly={true}
                        />
                    </div>
                </main>

                {/* Call-to-action at bottom */}
                {subscriptions.length > 0 && (
                    <div className="mt-12">
                        <CreateYourOwnCTA />
                    </div>
                )}
            </div>
        </div>
    );
} 