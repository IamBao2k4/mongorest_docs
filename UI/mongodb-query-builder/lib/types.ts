export interface Collection {
  name: string
  fields: CollectionField[]
}

export interface CollectionField {
  name: string
  type: "string" | "number" | "boolean" | "date" | "collection"
  collectionRef?: string // Reference to another collection if type is 'collection'
}

export interface Field {
  id: string
  name: string
  type: "simple" | "complex"
  selected: boolean // For projection
  collection?: string // For complex fields
  subFields?: Field[]
}

export interface Condition {
  id: string
  type: "simple" | "and" | "or"
  field?: string
  operator?: string
  value?: string
  subConditions?: Condition[]
}

export const OPERATORS = [
  // Comparison Operators
  { value: "eq", label: "Equal (eq)" },
  { value: "neq", label: "Not Equal (neq)" },
  { value: "gt", label: "Greater Than (gt)" },
  { value: "gte", label: "Greater Than or Equal (gte)" },
  { value: "lt", label: "Less Than (lt)" },
  { value: "lte", label: "Less Than or Equal (lte)" },

  // Text Operators
  { value: "like", label: "Like (like)" },
  { value: "ilike", label: "Case-Insensitive Like (ilike)" },
  { value: "match", label: "Match (match)" },
  { value: "imatch", label: "Case-Insensitive Match (imatch)" },

  // Array Operators
  { value: "in", label: "In (in)" },
  { value: "cs", label: "Contains (cs)" },
  { value: "cd", label: "Contained In (cd)" },
  { value: "ov", label: "Overlap (ov)" },

  // Null Operators
  { value: "is", label: "Is (is)" },
  { value: "isdistinct", label: "Distinct (isdistinct)" },

  // Logical Operators
  { value: "not", label: "Not (not)" },
]
