import { filterByRBAC } from "../../core/rbac/rbac-validator";

export class DataBase {
  protected RbacDatabase(data: any, jwt: string, collection: string): any {
    console.log(data, jwt, collection)
    return filterByRBAC(collection, "read", jwt, data)
  }
}