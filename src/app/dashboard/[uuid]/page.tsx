"use client";

import { useState, useEffect } from "react";

// This page uses dynamic routing and should not be statically generated
export const dynamic = 'force-dynamic';
import { useParams, useRouter } from "next/navigation";
import { createWorkspaceDB } from "@/lib/workspace-db";
import { WorkspaceStorage } from "@/lib/workspace-storage";
import { useUser } from "@/stack/hooks";
import { SubscriptionList } from "@/components/subscription-lister";
import { Sidebar } from "@/components/sidebar";
import { ExportDropdown } from "@/components/export-dropdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Plus, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common";
import DashboardHeader from "@/components/dashboard/header";
import { SecurityAlert } from "@/components/security-alert";
import { WorkspaceNameModal } from "@/components/workspace-name-modal";
import type { Subscription, SortOption } from "@/types";

// Validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export default function WorkspaceDashboard() {
    const params = useParams();
    const router = useRouter();
    const user = useUser();
    const workspaceId = params.uuid as string;
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("nextPayment-asc");
    const [workspaceDB, setWorkspaceDB] = useState<ReturnType<typeof createWorkspaceDB> | null>(null);
    const [showSecurityAlert, setShowSecurityAlert] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

    useEffect(() => {
        if (user === undefined) return;

        // Validate UUID
        if (!isValidUUID(workspaceId)) {
            setError("Invalid workspace ID");
            setIsLoading(false);
            return;
        }

        // Anonymous sessions only: remember last visited workspace in localStorage
        if (!user) {
            WorkspaceStorage.setLastWorkspace(workspaceId);
        }

        // Load saved sorting preferences
        const savedSorting = WorkspaceStorage.getSortingPreferences(workspaceId);
        if (savedSorting && savedSorting.sortBy) {
            setSortBy(savedSorting.sortBy);
        }

        // Initialize workspace database
        const db = createWorkspaceDB(workspaceId);
        setWorkspaceDB(db);
        
        checkAndInitializeWorkspace(db);
    }, [workspaceId, user]);

    // Save sorting preferences whenever they change
    useEffect(() => {
        if (workspaceId) {
            WorkspaceStorage.saveSortingPreferences(workspaceId, sortBy);
        }
    }, [workspaceId, sortBy]);

    const checkAndInitializeWorkspace = async (db: ReturnType<typeof createWorkspaceDB>) => {
        try {
            const access = await db.getAccessStatus();

            if (access === 'forbidden') {
                router.replace('/workspaces');
                return;
            }

            if (access === 'not_found') {
                if (user) {
                    router.replace('/workspaces?new=1');
                    return;
                }
                setShowNameModal(true);
                setIsLoading(false);
                return;
            }

            await initializeExistingWorkspace(db);
        } catch (error) {
            console.error("Failed to check workspace:", error);
            setError("Failed to load workspace. Please try again.");
            setIsLoading(false);
        }
    };

    const updateSecurityAlertVisibility = async (db: ReturnType<typeof createWorkspaceDB>) => {
        const info = await db.getWorkspaceInfo();
        if (!info) return;

        const dismissed = WorkspaceStorage.isSecurityAlertDismissed(workspaceId);
        setShowSecurityAlert(info.isAnonymous && !dismissed);
    };

    const initializeExistingWorkspace = async (db: ReturnType<typeof createWorkspaceDB>) => {
        try {
            await db.initializeWorkspace();
            await updateSecurityAlertVisibility(db);
            await loadSubscriptions(db);
        } catch (error) {
            console.error("Failed to initialize workspace:", error);
            setError("Failed to load workspace. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleWorkspaceNameConfirm = async (name: string) => {
        if (!workspaceDB) return;
        
        setIsCreatingWorkspace(true);
        
        try {
            await workspaceDB.initializeWorkspace(name);
            await updateSecurityAlertVisibility(workspaceDB);
            await loadSubscriptions(workspaceDB);
            setShowNameModal(false);
        } catch (error) {
            console.error("Failed to create workspace:", error);
            setError("Failed to create workspace. Please try again.");
        } finally {
            setIsCreatingWorkspace(false);
        }
    };

    const loadSubscriptions = async (db?: ReturnType<typeof createWorkspaceDB>) => {
        try {
            const database = db || workspaceDB;
            if (!database) return;
            
            const subs = await database.getAllSubscriptions();
            setSubscriptions(subs);
        } catch (error) {
            console.error("Failed to load subscriptions:", error);
            setError("Failed to load subscriptions. Please try again.");
        }
    };

    const handleSubscriptionSave = async () => {
        // Try to get from cache first for instant updates
        if (workspaceDB) {
            const cached = workspaceDB.getCachedSubscriptions();
            if (cached) {
                setSubscriptions(cached);
                return; // Update was instant from cache
            }
            
            // Fallback to async load if no cache
            try {
                const subs = await workspaceDB.getAllSubscriptions();
                setSubscriptions(subs);
            } catch (error) {
                console.error("Failed to refresh subscriptions:", error);
            }
        }
    };

    const filteredSubscriptions = selectedLabels.length > 0 
        ? subscriptions.filter((sub) => sub.labels.some((label) => selectedLabels.includes(label))) 
        : [];

    if (isLoading && !showNameModal && user === undefined) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner text="Loading your workspace..." />
            </div>
        );
    }

    if (isLoading && !showNameModal) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingSpinner text="Loading your workspace..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!workspaceDB) {
        return (
            <>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <LoadingSpinner text="Initializing workspace..." />
                </div>
                
                <WorkspaceNameModal
                    isOpen={showNameModal}
                    onConfirm={handleWorkspaceNameConfirm}
                    isCreating={isCreatingWorkspace}
                />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-300/50 dark:bg-neutral-950">
            <div className="container mx-auto p-6">
                <DashboardHeader 
                    onSubscriptionSave={handleSubscriptionSave} 
                    workspaceDB={workspaceDB}
                    workspaceId={workspaceId}
                />

                {/* Security Alert for Anonymous Workspaces */}
                {showSecurityAlert && (
                    <div className="mb-6">
                        <SecurityAlert
                            subscriptions={subscriptions}
                            filteredSubscriptions={filteredSubscriptions}
                            selectedLabels={selectedLabels}
                            onImportComplete={handleSubscriptionSave}
                            workspaceDB={workspaceDB}
                            workspaceId={workspaceId}
                            onDismiss={() => setShowSecurityAlert(false)}
                        />
                    </div>
                )}

                <main className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <Sidebar 
                        selectedLabels={selectedLabels} 
                        onLabelsChange={setSelectedLabels} 
                        subscriptions={subscriptions} 
                        filteredSubscriptions={filteredSubscriptions} 
                        workspaceDB={workspaceDB}
                    />

                    <div className="lg:col-span-3">
                        <div className="flex flex-col lg:flex-row gap-2 lg:gap-6 justify-between mb-4">
                            <h2 className="text-xl font-semibold">
                                {selectedLabels.length > 0 ? "Filtered Subscriptions" : "Your Subscriptions"}
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
                                    <ExportDropdown 
                                        subscriptions={subscriptions} 
                                        filteredSubscriptions={filteredSubscriptions} 
                                        selectedLabels={selectedLabels} 
                                        onImportComplete={handleSubscriptionSave} 
                                        workspaceDB={workspaceDB}
                                    />
                                </div>
                                
                            </div>
                        </div>

                        <SubscriptionList 
                            subscriptions={subscriptions} 
                            onUpdate={loadSubscriptions} 
                            selectedLabels={selectedLabels}
                            sortBy={sortBy}
                            workspaceDB={workspaceDB}
                        />
                    </div>
                </main>
            </div>
            
            <WorkspaceNameModal
                isOpen={showNameModal}
                onConfirm={handleWorkspaceNameConfirm}
                isCreating={isCreatingWorkspace}
            />
        </div>
    );
} 