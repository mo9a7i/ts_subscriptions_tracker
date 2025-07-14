"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"
import type { ImportResult } from "@/lib/import-utils"

interface ImportResultsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: ImportResult | null
}

export function ImportResultsDialog({ open, onOpenChange, result }: ImportResultsDialogProps) {
  if (!result) return null

  const hasErrors = result.errors.length > 0
  const hasSuccess = result.imported > 0
  const hasDuplicates = result.duplicates.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            Import Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Statistics */}
                      <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {result.imported}
                </div>
              <div className="text-sm text-green-600 dark:text-green-400">Imported</div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {result.skipped}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Skipped</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {result.errors.length}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Errors</div>
            </div>
          </div>

          {/* Success message */}
          {hasSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Successfully imported {result.imported} subscription{result.imported !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Duplicates */}
          {hasDuplicates && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  Duplicates Skipped ({result.duplicates.length})
                </span>
              </div>
              <div className="max-h-20 overflow-y-auto text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-2 rounded">
                {result.duplicates.join(', ')}
              </div>
            </div>
          )}

          {/* Errors */}
          {hasErrors && (
                          <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    Errors ({result.errors.length})
                  </span>
                </div>
                <div className="max-h-32 overflow-y-auto text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-2 rounded">
                  {result.errors.map((error, index) => (
                    <div key={index} className="mb-1">• {error}</div>
                  ))}
                </div>
              </div>
          )}

          {/* Info message */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <span className="text-xs text-blue-700 dark:text-blue-300">
              Duplicates are detected by matching subscription IDs. Only new subscriptions are imported.
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 