"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface QueryDisplayProps {
  queryUrl: string
  onQueryChange: (url: string) => void
}

export function QueryDisplay({ queryUrl, onQueryChange }: QueryDisplayProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="query-url">Generated Query URL</Label>
      <Textarea
        id="query-url"
        value={queryUrl}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Query URL will appear here..."
        className="min-h-[100px] font-mono text-sm"
      />
    </div>
  )
}
