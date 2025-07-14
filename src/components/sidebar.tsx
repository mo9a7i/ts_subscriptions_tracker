"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Filter, X } from "lucide-react"
import { db } from "@/lib/db"
import type { Label, SidebarProps } from "@/types"

export function Sidebar({ selectedLabels, onLabelsChange }: SidebarProps) {
  const [labels, setLabels] = useState<Label[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadLabels()
  }, [])

  const loadLabels = async () => {
    const allLabels = await db.getAllLabels()
    setLabels(allLabels)
  }

  const toggleLabel = (labelName: string) => {
    if (selectedLabels.includes(labelName)) {
      onLabelsChange(selectedLabels.filter((l) => l !== labelName))
    } else {
      onLabelsChange([...selectedLabels, labelName])
    }
  }

  const clearFilters = () => {
    onLabelsChange([])
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="md:hidden mb-4">
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {selectedLabels.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {selectedLabels.length}
          </Badge>
        )}
      </Button>

      <div className={`${isOpen ? "block" : "hidden"} md:block w-full md:w-64 space-y-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Filter by Labels</h3>
          {selectedLabels.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

          <div className="space-y-2">
            {labels.map((label) => (
              <Button
                key={label.id}
                variant={selectedLabels.includes(label.name) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLabel(label.name)}
                className="w-full justify-start"
              >
                {label.name}
              </Button>
            ))}
          </div>

        {selectedLabels.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Active Filters</h4>
              <div className="flex flex-wrap gap-1">
                {selectedLabels.map((label) => (
                  <Badge key={label} variant="secondary" className="flex items-center gap-1">
                    {label}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleLabel(label)} />
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
