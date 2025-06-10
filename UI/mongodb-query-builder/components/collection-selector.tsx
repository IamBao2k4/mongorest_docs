"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Collection } from "@/lib/types"

interface CollectionSelectorProps {
  collections: Collection[]
  selectedCollection: Collection | null
  onCollectionChange: (collection: Collection | null) => void
}

export function CollectionSelector({ collections, selectedCollection, onCollectionChange }: CollectionSelectorProps) {
  return (
    <Select
      value={selectedCollection?.name || ""}
      onValueChange={(value) => {
        const collection = collections.find((c) => c.name === value) || null
        onCollectionChange(collection)
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a collection" />
      </SelectTrigger>
      <SelectContent>
        {collections.map((collection) => (
          <SelectItem key={collection.name} value={collection.name}>
            {collection.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
