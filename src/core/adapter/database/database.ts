import { filterByRBAC } from "../../rbac/rbac-validator";

export class DataBase {
  protected RbacDatabase(data: any, operation: "read" | "write" | "delete" = "read", jwt: string, collection: string): any {
    return filterByRBAC(collection, operation, jwt, data)
  }
}