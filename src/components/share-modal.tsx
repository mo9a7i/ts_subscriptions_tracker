"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common";
import { Copy, CheckCheck, Share, ExternalLink } from "lucide-react";
import type { WorkspaceDatabase } from "@/lib/workspace-db";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceDB: WorkspaceDatabase;
  workspaceId: string;
}

export function ShareModal({ isOpen, onClose, workspaceDB, workspaceId }: ShareModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-load existing share link when modal opens
  useEffect(() => {
    const loadExistingShareLink = async () => {
      if (!isOpen || shareLink) return; // Don't reload if already have link
      
      setIsLoading(true);
      setError(null);
      
      try {
        const existingSharingUUID = await workspaceDB.getSharingUUID();
        if (existingSharingUUID) {
          const link = `${window.location.origin}/share/${existingSharingUUID}`;
          setShareLink(link);
        }
      } catch (error) {
        console.error("Failed to load existing share link:", error);
        // Don't show error for this, just let user generate new one
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingShareLink();
  }, [isOpen, workspaceDB, shareLink]);

  const generateShareLink = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const sharingUUID = await workspaceDB.generateSharingLink();
      const link = `${window.location.origin}/share/${sharingUUID}`;
      setShareLink(link);
    } catch (error) {
      console.error("Failed to generate share link:", error);
      setError("Failed to generate share link. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const openInNewTab = () => {
    if (shareLink) {
      window.open(shareLink, '_blank');
    }
  };

  const handleClose = () => {
    setShareLink(null);
    setError(null);
    setCopied(false);
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Share Your Subscription List
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a shareable link that allows others to view your subscription list in read-only mode.
          </p>

          {/* Loading existing share link */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner text="Loading share link..." />
            </div>
          )}

          {/* Generate button - only show if no link exists and not loading */}
          {!shareLink && !isGenerating && !isLoading && (
            <Button onClick={generateShareLink} className="w-full">
              <Share className="w-4 h-4 mr-2" />
              Generate Share Link
            </Button>
          )}

          {/* Generating new link */}
          {isGenerating && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner text="Generating share link..." />
            </div>
          )}

          {error && (
            <div className="text-center py-4">
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <Button onClick={generateShareLink} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {shareLink && (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  readOnly
                  value={shareLink}
                  className="flex-1"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  {copied ? (
                    <CheckCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={openInNewTab}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Your shareable link is ready to use
              </p>
              
              {copied && (
                <p className="text-xs text-green-600 text-center">
                  Link copied to clipboard!
                </p>
              )}

              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> This link allows read-only access to your subscription list. 
                  Visitors cannot edit or modify your data.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 