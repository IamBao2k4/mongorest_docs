"use client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import type { Collection, Field, CollectionField } from "@/lib/types"

interface FieldSelectorProps {
  collection: Collection
  allCollections: Collection[]
  fields: Field[]
  onFieldsChange: (fields: Field[]) => void
}

export function FieldSelector({ collection, allCollections, fields, onFieldsChange }: FieldSelectorProps) {
  const addSimpleField = () => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      name: "",
      type: "simple",
      selected: false,
    }
    onFieldsChange([...fields, newField])
  }

  const addComplexField = () => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      name: "",
      type: "complex",
      selected: false,
      subFields: [],
    }
    onFieldsChange([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<Field>) => {
    const updatedFields = fields.map((field) => (field.id === id ? { ...field, ...updates } : field))
    onFieldsChange(updatedFields)
  }

  const removeField = (id: string) => {
    onFieldsChange(fields.filter((field) => field.id !== id))
  }

  const getAvailableFields = (excludeCollections = false): CollectionField[] => {
    return collection.fields.filter((field) => !excludeCollections || field.type !== "collection")
  }

  const getCollectionFields = (collectionName: string): CollectionField[] => {
    const targetCollection = allCollections.find((c) => c.name === collectionName)
    return targetCollection?.fields || []
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={addSimpleField} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Simple Field
        </Button>
        <Button onClick={addComplexField} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Complex Field
        </Button>
      </div>

      {fields.map((field) => (
        <Card key={field.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-3">
              {field.type === "simple" ? (
                <SimpleFieldEditor
                  field={field}
                  availableFields={getAvailableFields(true)}
                  onUpdate={(updates) => updateField(field.id, updates)}
                />
              ) : (
                <ComplexFieldEditor
                  field={field}
                  collection={collection}
                  allCollections={allCollections}
                  availableFields={getAvailableFields()}
                  onUpdate={(updates) => updateField(field.id, updates)}
                />
              )}
            </div>
            <Button
              onClick={() => removeField(field.id)}
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

interface SimpleFieldEditorProps {
  field: Field
  availableFields: CollectionField[]
  onUpdate: (updates: Partial<Field>) => void
}

function SimpleFieldEditor({ field, availableFields, onUpdate }: SimpleFieldEditorProps) {
  return (
    <div className="flex items-center gap-3">
      <Select value={field.name} onValueChange={(name) => onUpdate({ name })}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select field" />
        </SelectTrigger>
        <SelectContent>
          {availableFields.map((availableField) => (
            <SelectItem key={availableField.name} value={availableField.name}>
              {availableField.name} ({availableField.type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`checkbox-${field.id}`}
          checked={field.selected}
          onCheckedChange={(checked) => onUpdate({ selected: !!checked })}
        />
        <label htmlFor={`checkbox-${field.id}`} className="text-sm">
          Include
        </label>
      </div>
    </div>
  )
}

interface ComplexFieldEditorProps {
  field: Field
  collection: Collection
  allCollections: Collection[]
  availableFields: CollectionField[]
  onUpdate: (updates: Partial<Field>) => void
}

function ComplexFieldEditor({ field, collection, allCollections, availableFields, onUpdate }: ComplexFieldEditorProps) {
  const collectionFields = availableFields.filter((f) => f.type === "collection")
  const selectedCollectionRef = availableFields.find((f) => f.name === field.name)?.collectionRef
  const targetCollection = allCollections.find((c) => c.name === selectedCollectionRef)

  const updateSubFields = (subFields: Field[]) => {
    onUpdate({ subFields })
  }

  return (
    <div className="space-y-3">
      <Select
        value={field.name}
        onValueChange={(name) => {
          const selectedField = availableFields.find((f) => f.name === name)
          onUpdate({
            name,
            collection: selectedField?.collectionRef,
            subFields: [],
          })
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select collection field" />
        </SelectTrigger>
        <SelectContent>
          {collectionFields.map((collectionField) => (
            <SelectItem key={collectionField.name} value={collectionField.name}>
              {collectionField.name} → {collectionField.collectionRef}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {targetCollection && (
        <Card className="ml-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sub-fields for {targetCollection.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSelector
              collection={targetCollection}
              allCollections={allCollections}
              fields={field.subFields || []}
              onFieldsChange={updateSubFields}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
