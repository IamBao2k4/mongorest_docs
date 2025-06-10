import type { Collection } from "./types"

export const mockCollections: Collection[] = [
  {
    name: "products",
    fields: [
      { name: "id", type: "string" },
      { name: "name", type: "string" },
      { name: "price", type: "number" },
      { name: "stock", type: "number" },
      { name: "status", type: "string" },
      { name: "category", type: "collection", collectionRef: "categories" },
      { name: "tags", type: "string" },
      { name: "createdAt", type: "date" },
      { name: "active", type: "boolean" },
    ],
  },
  {
    name: "categories",
    fields: [
      { name: "id", type: "string" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "parent", type: "collection", collectionRef: "categories" },
      { name: "active", type: "boolean" },
    ],
  },
  {
    name: "users",
    fields: [
      { name: "id", type: "string" },
      { name: "email", type: "string" },
      { name: "name", type: "string" },
      { name: "age", type: "number" },
      { name: "active", type: "boolean" },
      { name: "profile", type: "collection", collectionRef: "profiles" },
      { name: "createdAt", type: "date" },
    ],
  },
  {
    name: "profiles",
    fields: [
      { name: "id", type: "string" },
      { name: "bio", type: "string" },
      { name: "avatar", type: "string" },
      { name: "preferences", type: "string" },
    ],
  },
]
