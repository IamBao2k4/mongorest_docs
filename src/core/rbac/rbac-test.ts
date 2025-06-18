import { RbacValidator } from "./rbac-validator";

const collection_name = "product_categories";
const action = "read";
const userRoles = ["default"];
const features : string[] = [];

const rbacValidator = new RbacValidator();

rbacValidator.loadConfig(); // Ensure the RBAC configuration is loaded

if (rbacValidator.hasAccess(collection_name, action, userRoles)) {
    if( features.length === 0 ) {
        console.log(RbacValidator.getRbacFeatures(collection_name, action, userRoles));
    }
    else {
        console.log(RbacValidator.filterRbacFeatures(collection_name, action, userRoles, features));
    }
} else {
    console.log(`User does not have access to ${action} on collection ${collection_name}`);
}