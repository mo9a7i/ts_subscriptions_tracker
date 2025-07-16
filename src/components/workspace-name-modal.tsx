"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus, Sparkles } from "lucide-react";

interface WorkspaceNameModalProps {
  isOpen: boolean;
  onConfirm: (name: string) => void;
  isCreating: boolean;
}

export function WorkspaceNameModal({ isOpen, onConfirm, isCreating }: WorkspaceNameModalProps) {
  const [workspaceName, setWorkspaceName] = useState("");
  const placeholder = "Ahmed's Subscriptions List";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = workspaceName.trim() || placeholder;
    onConfirm(finalName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-primary" />
            Create Your Subscription Tracker
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Welcome! Let's give your subscription tracker a personalized name.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              type="text"
              placeholder={placeholder}
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isCreating}
              autoFocus
              className="text-center"
            />
            <p className="text-xs text-muted-foreground text-center">
              Leave empty to use the default name
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating workspace...
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Workspace
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 