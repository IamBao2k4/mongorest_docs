"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import type { Collection, Condition } from "@/lib/types"
import { OPERATORS } from "@/lib/types"

interface ConditionBuilderProps {
  collection: Collection
  conditions: Condition[]
  onConditionsChange: (conditions: Condition[]) => void
}

export function ConditionBuilder({ collection, conditions, onConditionsChange }: ConditionBuilderProps) {
  const addCondition = (type: "simple" | "and" | "or") => {
    const newCondition: Condition = {
      id: `condition_${Date.now()}`,
      type,
      ...(type === "simple" ? {} : { subConditions: [] }),
    }
    onConditionsChange([...conditions, newCondition])
  }

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    const updatedConditions = conditions.map((condition) =>
      condition.id === id ? { ...condition, ...updates } : condition,
    )
    onConditionsChange(updatedConditions)
  }

  const removeCondition = (id: string) => {
    onConditionsChange(conditions.filter((condition) => condition.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => addCondition("simple")} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Simple
        </Button>
        <Button onClick={() => addCondition("and")} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          AND
        </Button>
        <Button onClick={() => addCondition("or")} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          OR
        </Button>
      </div>

      {conditions.map((condition) => (
        <Card key={condition.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              {condition.type === "simple" ? (
                <SimpleConditionEditor
                  condition={condition}
                  collection={collection}
                  onUpdate={(updates) => updateCondition(condition.id, updates)}
                />
              ) : (
                <LogicalConditionEditor
                  condition={condition}
                  collection={collection}
                  onUpdate={(updates) => updateCondition(condition.id, updates)}
                />
              )}
            </div>
            <Button
              onClick={() => removeCondition(condition.id)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

interface SimpleConditionEditorProps {
  condition: Condition
  collection: Collection
  onUpdate: (updates: Partial<Condition>) => void
}

function SimpleConditionEditor({ condition, collection, onUpdate }: SimpleConditionEditorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Select value={condition.field || ""} onValueChange={(field) => onUpdate({ field })}>
        <SelectTrigger>
          <SelectValue placeholder="Select field" />
        </SelectTrigger>
        <SelectContent>
          {collection.fields.map((field) => (
            <SelectItem key={field.name} value={field.name}>
              {field.name} ({field.type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={condition.operator || ""} onValueChange={(operator) => onUpdate({ operator })}>
        <SelectTrigger>
          <SelectValue placeholder="Select operator" />
        </SelectTrigger>
        <SelectContent>
          {OPERATORS.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input placeholder="Value" value={condition.value || ""} onChange={(e) => onUpdate({ value: e.target.value })} />
    </div>
  )
}

interface LogicalConditionEditorProps {
  condition: Condition
  collection: Collection
  onUpdate: (updates: Partial<Condition>) => void
}

function LogicalConditionEditor({ condition, collection, onUpdate }: LogicalConditionEditorProps) {
  const updateSubConditions = (subConditions: Condition[]) => {
    onUpdate({ subConditions })
  }

  return (
    <Card className="ml-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm uppercase">{condition.type} Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <ConditionBuilder
          collection={collection}
          conditions={condition.subConditions || []}
          onConditionsChange={updateSubConditions}
        />
      </CardContent>
    </Card>
  )
}
