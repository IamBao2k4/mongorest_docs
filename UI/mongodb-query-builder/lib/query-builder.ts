import type { Field, Condition } from "./types"

export function buildQueryUrl(rootApi: string, collection: string, fields: Field[], conditions: Condition[]): string {
  const url = new URL(`${rootApi}/${collection}`)

  // Build select parameter
  const selectParts = buildSelectString(fields)
  if (selectParts) {
    url.searchParams.set("select", selectParts)
  }

  // Build condition parameters
  const conditionParams = buildConditionParams(conditions)
  conditionParams.forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return url.toString()
}

function buildSelectString(fields: Field[]): string {
  const parts: string[] = []

  fields.forEach((field) => {
    if (field.type === "simple" && field.selected) {
      parts.push(field.name)
    } else if (field.type === "complex") {
      const subSelect = field.subFields ? buildSelectString(field.subFields) : ""
      if (subSelect) {
        parts.push(`${field.name}(${subSelect})`)
      } else {
        parts.push(`${field.name}()`)
      }
    }
  })

  return parts.join(",")
}

function buildConditionParams(conditions: Condition[]): [string, string][] {
  const params: [string, string][] = []

  conditions.forEach((condition) => {
    if (condition.type === "simple" && condition.field && condition.operator && condition.value !== undefined) {
      params.push([condition.field, `${condition.operator}.${condition.value}`])
    } else if (condition.type === "and" && condition.subConditions) {
      const subParams = buildConditionParams(condition.subConditions)
      if (subParams.length > 0) {
        const andValue = subParams.map(([key, value]) => `${key}=${value}`).join(",")
        params.push(["and", `(${andValue})`])
      }
    } else if (condition.type === "or" && condition.subConditions) {
      const subParams = buildConditionParams(condition.subConditions)
      if (subParams.length > 0) {
        const orValue = subParams.map(([key, value]) => `${key}=${value}`).join(",")
        params.push(["or", `(${orValue})`])
      }
    }
  })

  return params
}
