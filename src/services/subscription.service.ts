import { db } from "@/lib/db";
import { isPaymentOverdue, getNextPaymentDate } from "@/lib/date-utils";
import type { Subscription, SortOption, SubscriptionFrequency, CreateSubscriptionData } from "@/types";

export class SubscriptionService {
    // CRUD Operations
    static async getAllSubscriptions(): Promise<Subscription[]> {
        return await db.getAllSubscriptions();
    }

    static async createSubscription(subscription: CreateSubscriptionData): Promise<Subscription> {
        return await db.addSubscription(subscription);
    }

    static async updateSubscription(id: string, updates: Partial<Subscription>): Promise<void> {
        return await db.updateSubscription(id, updates);
    }

    static async deleteSubscription(id: string): Promise<void> {
        return await db.deleteSubscription(id);
    }

    // Filtering Logic
    static filterSubscriptionsByLabels(subscriptions: Subscription[], selectedLabels: string[]): Subscription[] {
        if (selectedLabels.length === 0) {
            return subscriptions;
        }
        return subscriptions.filter((sub) => 
            sub.labels.some((label) => selectedLabels.includes(label))
        );
    }

    // Sorting Logic
    static sortSubscriptions(subscriptions: Subscription[], sortBy: SortOption): Subscription[] {
        return [...subscriptions].sort((a, b) => {
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
                    const aAmountSAR = this.convertToSAR(a.amount, a.currency);
                    const bAmountSAR = this.convertToSAR(b.amount, b.currency);
                    comparison = aAmountSAR - bAmountSAR;
                    break;
            }

            return order === "desc" ? -comparison : comparison;
        });
    }

    // Currency Conversion Logic
    static convertToSAR(amount: number, currency: string): number {
        const rates: Record<string, number> = {
            USD: 3.75,
            EUR: 4.1,
            GBP: 4.8,
            CAD: 2.8,
            SAR: 1
        };
        return amount * (rates[currency] || 1);
    }

    // Auto-Renewal Logic
    static async processOverdueSubscriptions(subscriptions: Subscription[]): Promise<boolean> {
        let hasUpdates = false;
        
        for (const subscription of subscriptions) {
            if (isPaymentOverdue(subscription.nextPayment) && subscription.autoRenewal !== false) {
                const newNextPayment = getNextPaymentDate(subscription.nextPayment, subscription.frequency);
                if (newNextPayment !== subscription.nextPayment) {
                    await this.updateSubscription(subscription.id, { nextPayment: newNextPayment });
                    hasUpdates = true;
                }
            }
        }
        
        return hasUpdates;
    }

    // Frequency Color Logic
    static getFrequencyColor(frequency: any): string {
        const colorMap: Record<any, string> = {
            weekly: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
            monthly: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
            quarterly: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
            yearly: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
        };
        
        return colorMap[frequency] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }

    // Combined Filtering and Sorting
    static processSubscriptions(
        subscriptions: Subscription[], 
        selectedLabels: string[], 
        sortBy: SortOption
    ): Subscription[] {
        const filtered = this.filterSubscriptionsByLabels(subscriptions, selectedLabels);
        return this.sortSubscriptions(filtered, sortBy);
    }

    // Dashboard-specific filtering (returns filtered count, not all)
    static getFilteredSubscriptionsForDashboard(subscriptions: Subscription[], selectedLabels: string[]): Subscription[] {
        return selectedLabels.length > 0 
            ? this.filterSubscriptionsByLabels(subscriptions, selectedLabels)
            : [];
    }

    // Statistics and Analytics
    static calculateTotalMonthlyCost(subscriptions: Subscription[]): number {
        return subscriptions.reduce((total, sub) => {
            const monthlyCost = this.convertToMonthlyCost(sub.amount, sub.frequency);
            return total + this.convertToSAR(monthlyCost, sub.currency);
        }, 0);
    }

    static convertToMonthlyCost(amount: number, frequency: any): number {
        const multipliers: Record<any, number> = {
            weekly: 4.33, // Average weeks per month
            monthly: 1,
            quarterly: 1/3,
            yearly: 1/12
        };
        
        return amount * (multipliers[frequency] || 1);
    }

    // Label Management
    static async getAllUniqueLabels(): Promise<string[]> {
        return await db.getAllUniqueLabels();
    }

    // Validation Helpers
    static validateSubscription(subscription: Partial<Subscription>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (!subscription.name?.trim()) {
            errors.push("Subscription name is required");
        }
        
        if (!subscription.amount || subscription.amount <= 0) {
            errors.push("Amount must be greater than 0");
        }
        
        if (!subscription.nextPayment) {
            errors.push("Next payment date is required");
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
} 