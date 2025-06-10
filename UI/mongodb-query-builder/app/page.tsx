"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CollectionSelector } from "@/components/collection-selector"
import { FieldSelector } from "@/components/field-selector"
import { ConditionBuilder } from "@/components/condition-builder"
import { QueryDisplay } from "@/components/query-display"
import { ResponseDisplay } from "@/components/response-display"
import { mockCollections } from "@/lib/mock-data"
import { buildQueryUrl } from "@/lib/query-builder"
import type { Field, Condition, Collection } from "@/lib/types"

export default function MongoDBQueryBuilder() {
  const [jwt, setJwt] = useState("")
  const [rootApi, setRootApi] = useState("http://localhost:3000")
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [queryUrl, setQueryUrl] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const updateQuery = () => {
    if (selectedCollection) {
      const url = buildQueryUrl(rootApi, selectedCollection.name, fields, conditions)
      setQueryUrl(url)
    }
  }

  const executeQuery = async () => {
    if (!queryUrl) return

    setIsLoading(true)
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (jwt) {
        headers["Authorization"] = `Bearer ${jwt}`
      }

      const res = await fetch(queryUrl, { headers })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Update query whenever dependencies change
  React.useEffect(() => {
    updateQuery()
  }, [selectedCollection, fields, conditions, rootApi])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">MongoDB Query Builder</h1>
        <p className="text-muted-foreground mt-2">Build and execute MongoDB REST queries with a visual interface</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Connection Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jwt">JWT Token</Label>
                <Input
                  id="jwt"
                  type="password"
                  placeholder="Enter JWT token (optional)"
                  value={jwt}
                  onChange={(e) => setJwt(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rootApi">Root API URL</Label>
                <Input
                  id="rootApi"
                  placeholder="http://localhost:3000"
                  value={rootApi}
                  onChange={(e) => setRootApi(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Collection Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <CollectionSelector
                collections={mockCollections}
                selectedCollection={selectedCollection}
                onCollectionChange={setSelectedCollection}
              />
            </CardContent>
          </Card>

          {/* Field Selection */}
          {selectedCollection && (
            <Card>
              <CardHeader>
                <CardTitle>Fields Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldSelector
                  collection={selectedCollection}
                  allCollections={mockCollections}
                  fields={fields}
                  onFieldsChange={setFields}
                />
              </CardContent>
            </Card>
          )}

          {/* Conditions */}
          {selectedCollection && (
            <Card>
              <CardHeader>
                <CardTitle>Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <ConditionBuilder
                  collection={selectedCollection}
                  conditions={conditions}
                  onConditionsChange={setConditions}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Query and Response Panel */}
        <div className="space-y-6">
          {/* Query Display */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Query</CardTitle>
            </CardHeader>
            <CardContent>
              <QueryDisplay queryUrl={queryUrl} onQueryChange={setQueryUrl} />
              <Button onClick={executeQuery} disabled={!queryUrl || isLoading} className="w-full mt-4">
                {isLoading ? "Executing..." : "Execute Query"}
              </Button>
            </CardContent>
          </Card>

          {/* Response Display */}
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponseDisplay response={response} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
