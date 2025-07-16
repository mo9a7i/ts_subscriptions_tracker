"use client";

import { useState } from "react";
// Using custom alert instead of shadcn alert (not available)
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExportDropdown } from "@/components/export-dropdown";
import { Shield, Download, UserPlus, X } from "lucide-react";
import type { Subscription } from "@/types";
import type { WorkspaceDatabase } from "@/lib/workspace-db";

interface SecurityAlertProps {
  subscriptions: Subscription[];
  filteredSubscriptions: Subscription[];
  selectedLabels: string[];
  onImportComplete: () => void;
  workspaceDB: WorkspaceDatabase;
  onDismiss: () => void;
}

export function SecurityAlert({ 
  subscriptions, 
  filteredSubscriptions, 
  selectedLabels, 
  onImportComplete, 
  workspaceDB,
  onDismiss 
}: SecurityAlertProps) {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return (
    <>
      <div className="border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-amber-800 dark:text-amber-200">
              <strong>Security Notice:</strong> This workspace is anonymous and editable by anyone with this link. 
              Export your data for backup or sign up to protect it.
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSignInModalOpen(true)}
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 dark:text-amber-200 dark:border-amber-700"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Sign Up
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      <Dialog open={isSignInModalOpen} onOpenChange={setIsSignInModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              User Authentication
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-center py-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Coming Soon!</h3>
            <p className="text-muted-foreground">
              User authentication and account protection features are currently in development. 
              For now, please export your data regularly to keep it safe.
            </p>
            <Button onClick={() => setIsSignInModalOpen(false)} className="w-full">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 