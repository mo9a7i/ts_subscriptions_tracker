"use client";

import { useState } from "react";
import { SubscriptionModal } from "@/components/subscription-modal";
import { ShareModal } from "@/components/share-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import Link from "next/link";
import type { WorkspaceDatabase } from "@/lib/workspace-db";

interface DashboardHeaderProps {
    onSubscriptionSave: () => void;
    workspaceDB: WorkspaceDatabase;
    workspaceId: string;
}

export default function DashboardHeader({ onSubscriptionSave, workspaceDB, workspaceId }: DashboardHeaderProps) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    return (
        <>
            <header className="flex flex-col lg:flex-row gap-2 lg:gap-6 justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Subscription Tracker</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Manage and track your recurring subscriptions
                    </p>
                </div>
                <div className="flex items-center justify-end gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Share className="w-4 h-4" />
                        Share
                    </Button>
                    <SubscriptionModal onSave={onSubscriptionSave} workspaceDB={workspaceDB} />
                    <ThemeToggle />
                </div>
            </header>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                workspaceDB={workspaceDB}
                workspaceId={workspaceId}
            />
        </>
    );
}