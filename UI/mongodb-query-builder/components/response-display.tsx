import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ResponseDisplayProps {
  response: string
}

export function ResponseDisplay({ response }: ResponseDisplayProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="response">JSON Response</Label>
      <Textarea
        id="response"
        value={response}
        readOnly
        placeholder="Response will appear here after executing the query..."
        className="min-h-[300px] font-mono text-sm"
      />
    </div>
  )
}
