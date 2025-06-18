import { QueryParams } from "../index";
import { RbacValidator } from "../rbac/rbac-validator";

export abstract class Core {
    protected rbacValidator: RbacValidator;

    constructor() {
        this.rbacValidator = new RbacValidator();
        this.rbacValidator.loadConfig();
    }

    public convert(params: QueryParams, collection: string, roles: string[]) : any{}
    
}