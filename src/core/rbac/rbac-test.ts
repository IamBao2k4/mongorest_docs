import { RbacValidator } from "./rbac-validator";

const collection_name = "users";
const action = "write";
const userRoles = ["default"];
const features : any = {
  "email": "nguyenvanan@example.com",
  "name": "Nguyen Van An",
  "profile": {
    "age": 28,
    "country": "Vietnam",
    "interests": ["technology", "travel", "gaming", "fitness"],
    "avatar": "https://example.com/avatars/user123.jpg"
  },
  "status": "active",
  "lastLogin": "2025-01-19T14:30:00Z"
};

const rbacValidator = new RbacValidator();

if (rbacValidator.hasAccess(collection_name, action, userRoles)) {
    // if( features.length === 0 ) {
    //     console.log(rbacValidator.getRbacFeatures(collection_name, action, userRoles));
    // }
    // else {
    //     console.log(rbacValidator.filterRbacFeatures(collection_name, action, userRoles, features));
    // }
    const filteredData = rbacValidator.filterBodyData(collection_name, action, userRoles, features);
    console.log(`User has access to ${action} on collection ${collection_name}`);
    console.log("Filtered Data:", filteredData);
} else {
    console.log(`User does not have access to ${action} on collection ${collection_name}`);
}