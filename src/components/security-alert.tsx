"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExportDropdown } from "@/components/export-dropdown";
import { Shield, UserPlus, X } from "lucide-react";
import { useHexclaveApp, useUser } from "@/stack/hooks";
import type { Subscription } from "@/types";
import { WorkspaceStorage } from "@/lib/workspace-storage";
import type { WorkspaceDatabase } from "@/lib/workspace-db";

interface SecurityAlertProps {
  subscriptions: Subscription[];
  filteredSubscriptions: Subscription[];
  selectedLabels: string[];
  onImportComplete: () => void;
  workspaceDB: WorkspaceDatabase;
  workspaceId: string;
  onDismiss: () => void;
}

export function SecurityAlert({ 
  subscriptions, 
  filteredSubscriptions, 
  selectedLabels, 
  onImportComplete, 
  workspaceDB,
  workspaceId,
  onDismiss 
}: SecurityAlertProps) {
  const app = useHexclaveApp();
  const user = useUser();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const handleSignUp = () => {
    app.redirectToSignUp();
  };

  const handleDismiss = () => {
    WorkspaceStorage.dismissSecurityAlert(workspaceId);
    onDismiss();
  };

  const handleClaimWorkspace = async () => {
    setIsClaiming(true);
    setClaimError(null);
    try {
      await workspaceDB.claimWorkspace();
      onDismiss();
    } catch (error) {
      console.error("Failed to claim workspace:", error);
      setClaimError(error instanceof Error ? error.message : "Failed to claim workspace");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-amber-800 dark:text-amber-200">
            <strong>Security Notice:</strong> This workspace is anonymous and editable by anyone with this link. 
            {user ? " Claim it to link it to your account." : " Export your data for backup or sign up to protect it."}
            {claimError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{claimError}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-amber-100 hover:bg-amber-200 rounded border border-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 dark:border-amber-700">
            <ExportDropdown 
              subscriptions={subscriptions} 
              filteredSubscriptions={filteredSubscriptions} 
              selectedLabels={selectedLabels} 
              onImportComplete={onImportComplete} 
              workspaceDB={workspaceDB}
            />
          </div>
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClaimWorkspace}
              disabled={isClaiming}
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 dark:text-amber-200 dark:border-amber-700"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              {isClaiming ? "Claiming..." : "Claim Workspace"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignUp}
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 dark:text-amber-200 dark:border-amber-700"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Sign Up
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
