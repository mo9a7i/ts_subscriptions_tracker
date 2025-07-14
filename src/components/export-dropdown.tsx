"use client"

import { useState } from "react"
import { Download, FileDown, FileSpreadsheet, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exportToJSON, exportToXLSX } from "@/lib/export-utils"
import { importFromJSON, triggerFileInput, type ImportResult } from "@/lib/import-utils"
import { ImportResultsDialog } from "@/components/import-results-dialog"
import type { Subscription } from "@/types"

interface ExportDropdownProps {
  subscriptions: Subscription[]
  filteredSubscriptions?: Subscription[]
  selectedLabels?: string[]
  onImportComplete?: () => void
}

export function ExportDropdown({ 
  subscriptions, 
  filteredSubscriptions = [], 
  selectedLabels = [],
  onImportComplete
}: ExportDropdownProps) {
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [showImportResults, setShowImportResults] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Determine which data to export
  const dataToExport = filteredSubscriptions.length > 0 ? filteredSubscriptions : subscriptions
  const isFiltered = filteredSubscriptions.length > 0

  const handleJSONExport = () => {
    const filename = isFiltered 
      ? `subscriptions-filtered-${selectedLabels.join('-').toLowerCase()}` 
      : 'subscriptions'
    exportToJSON(dataToExport, filename)
  }

  const handleXLSXExport = () => {
    const filename = isFiltered 
      ? `subscriptions-filtered-${selectedLabels.join('-').toLowerCase()}` 
      : 'subscriptions'
    exportToXLSX(dataToExport, filename)
  }

  const handleJSONImport = async () => {
    try {
      setIsImporting(true)
      const jsonData = await triggerFileInput()
      const result = await importFromJSON(jsonData)
      
      setImportResult(result)
      setShowImportResults(true)
      
      if (result.success && onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      console.error('Import failed:', error)
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Import cancelled or failed'],
        duplicates: []
      })
      setShowImportResults(true)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isImporting}>
            <Download className="w-4 h-4 mr-2" />
            {isImporting ? 'Importing...' : 'Export'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleJSONImport} disabled={isImporting}>
            <Upload className="w-4 h-4 mr-2" />
            Import from JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {dataToExport.length > 0 && (
            <>
              <DropdownMenuItem onClick={handleJSONExport}>
                <FileDown className="w-4 h-4 mr-2" />
                Export as JSON
                <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
                  {dataToExport.length.toLocaleString('en-US')} items
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleXLSXExport}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as Excel
                <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
                  {dataToExport.length.toLocaleString('en-US')} items
                </span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ImportResultsDialog
        open={showImportResults}
        onOpenChange={setShowImportResults}
        result={importResult}
      />
    </>
  )
} 