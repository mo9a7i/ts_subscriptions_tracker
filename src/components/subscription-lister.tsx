"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Ellipsis, RotateCcw, Loader2 } from "lucide-react";
import { SubscriptionModal } from "@/components/subscription-modal";
import { formatCurrency, formatInSAR, getCurrencySymbol } from "@/lib/currency";
import { formatNextPayment, getNextPaymentDate, isPaymentOverdue } from "@/lib/date-utils";
import { getBestColorForBackground } from "@/lib/color-utils";
import { SubscriptionEmptyState } from "@/components/common/empty-state";
import type { Subscription, SubscriptionListProps, SortOption } from "@/types";
import type { WorkspaceDatabase } from "@/lib/workspace-db";
import Link from "next/link";

export function SubscriptionList({ subscriptions, onUpdate, selectedLabels, sortBy, workspaceDB, readonly = false }: SubscriptionListProps) {
    const [deletingSubscriptionId, setDeletingSubscriptionId] = useState<string | null>(null);
    const [hasCheckedOverdue, setHasCheckedOverdue] = useState(false);

    // Check and update overdue subscriptions only once per session
    useEffect(() => {
        const checkOverdueSubscriptions = async () => {
            // Skip if readonly mode, already checked this session, no workspaceDB, or no subscriptions
            if (readonly || hasCheckedOverdue || !workspaceDB || subscriptions.length === 0) return;
            
            let hasUpdates = false;
            const updates: Promise<void>[] = [];
            
            for (const subscription of subscriptions) {
                if (isPaymentOverdue(subscription.nextPayment) && subscription.autoRenewal !== false) {
                    const newNextPayment = getNextPaymentDate(subscription.nextPayment, subscription.frequency);
                    if (newNextPayment !== subscription.nextPayment) {
                        // Batch updates instead of sequential
                        updates.push(workspaceDB!.updateSubscription(subscription.id, { nextPayment: newNextPayment }));
                        hasUpdates = true;
                    }
                }
            }
            
            if (hasUpdates) {
                // Execute all updates in parallel
                await Promise.all(updates);
                onUpdate(); // Refresh the list once after all updates
                setHasCheckedOverdue(true); // Mark as checked for this session
            }
        };

        checkOverdueSubscriptions();
    }, [subscriptions.length, hasCheckedOverdue, workspaceDB, onUpdate]); // More specific dependencies

    const filteredSubscriptions = selectedLabels.length > 0 ? subscriptions.filter((sub) => sub.labels.some((label) => selectedLabels.includes(label))) : subscriptions;

    // Sort subscriptions
    const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
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
                // Convert to SAR for fair comparison
                const aAmountSAR = a.amount * (a.currency === "USD" ? 3.75 : a.currency === "EUR" ? 4.1 : a.currency === "GBP" ? 4.8 : a.currency === "CAD" ? 2.8 : 1);
                const bAmountSAR = b.amount * (b.currency === "USD" ? 3.75 : b.currency === "EUR" ? 4.1 : b.currency === "GBP" ? 4.8 : b.currency === "CAD" ? 2.8 : 1);
                comparison = aAmountSAR - bAmountSAR;
                break;
        }

        return order === "desc" ? -comparison : comparison;
    });

    const getFrequencyColor = (frequency: string) => {
        switch (frequency) {
            case "weekly":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
            case "monthly":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
            case "quarterly":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
            case "yearly":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
        }
    };

    const handleDeleteStart = (subscriptionId: string) => {
        setDeletingSubscriptionId(subscriptionId);
    };

    const handleDeleteEnd = () => {
        setDeletingSubscriptionId(null);
        onUpdate(); // Refresh the list
    };

    // Show empty state if no subscriptions exist
    if (sortedSubscriptions.length === 0) {
        if (readonly) {
            return (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">This shared workspace has no subscriptions yet.</p>
                </div>
            );
        }
        
        return (
            <SubscriptionEmptyState 
                onAddSubscription={onUpdate}
                workspaceDB={workspaceDB}
            />
        );
    }

    return (
        <div className="space-y-1 lg:space-y-2">
            {sortedSubscriptions.map((subscription) => {
                const backgroundColorOverlay = subscription.colors ? getBestColorForBackground(subscription.colors) : null;
                const isDeleting = deletingSubscriptionId === subscription.id;

                return (
                    <Card 
                        key={subscription.id} 
                        className={`relative rounded-md border-0 py-2 overflow-hidden transition-all duration-200 ${
                            isDeleting 
                                ? 'opacity-50 pointer-events-none bg-destructive/5 border-destructive/20' 
                                : ''
                        }`}
                    >
                        {backgroundColorOverlay && <div className="absolute inset-0 opacity-50" style={{ backgroundColor: backgroundColorOverlay }} />}
                        <div className="absolute inset-0 " />

                        {/* Deleting overlay */}
                        {isDeleting && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                                <div className="flex items-center gap-2 text-destructive">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm font-medium">Deleting...</span>
                                </div>
                            </div>
                        )}

                        <CardContent className="px-4 py-0 relative z-10">
                            <div className="gap-2 flex flex-col lg:flex-row items-start justify-between">
                                <div className="flex items-start gap-2 lg:gap-4 flex-1">
                                    {subscription.icon && <div className="lg:w-10 lg:h-10 w-6 h-6  rounded-md flex items-center justify-center outline-none flex-shrink-0">{subscription.icon.startsWith("data:") || subscription.icon.startsWith("http") ? <img src={subscription.icon || "/placeholder.svg"} alt={subscription.name} className="outline-none rounded" /> : <span className="text-lg">{subscription.icon}</span>}</div>}

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            {subscription.url ? (
                                                <Link href={subscription.url} target="_blank" rel="noopener noreferrer" className="font-semibold truncate text-sm hover:underline ">
                                                    {subscription.name}
                                                </Link>
                                            ) : (
                                                <h3 className="font-semibold truncate text-sm">{subscription.name}</h3>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Badge className={getFrequencyColor(subscription.frequency)}>{subscription.frequency}</Badge>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-neutral-900 dark:text-neutral-400">
                                            <div className="flex items-center gap-2">
                                                <span>{formatNextPayment(subscription.nextPayment, subscription.frequency)}</span>
                                                {isPaymentOverdue(subscription.nextPayment) && subscription.autoRenewal === false && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Overdue
                                                    </Badge>
                                                )}
                                            </div>

                                            {subscription.autoRenewal !== false && (
                                                <div className="flex items-center gap-1 text-green-800 dark:text-green-400">
                                                    <RotateCcw className="w-3 h-3" />
                                                    <span className="text-xs">Auto</span>
                                                </div>
                                            )}

                                            {subscription.labels.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {subscription.labels.map((label) => (
                                                        <Badge key={label} className="text-xs border-0 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                                                            {label}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {subscription.comment && <span className="truncate max-w-xs">{subscription.comment}</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-right flex items-center gap-2">
                                            <div className="font-bold whitespace-nowrap">{formatCurrency(subscription.amount, subscription.currency)}</div>
                                        </div>
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{subscription.currency !== "SAR" && <div>≈ {formatInSAR(subscription.amount, subscription.currency)}</div>}</div>
                                    </div>
                                </div>

                                {!readonly && (
                                    <div className="justify-start flex self-start text-xs items-center gap-1 flex-shrink-0">
                                        <SubscriptionModal
                                            subscription={subscription}
                                            onSave={onUpdate}
                                            workspaceDB={workspaceDB}
                                            onDeleteStart={() => handleDeleteStart(subscription.id)}
                                            onDeleteEnd={handleDeleteEnd}
                                            trigger={
                                                <Button variant="ghost" size="sm" disabled={isDeleting}>
                                                    <Ellipsis />
                                                </Button>
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
