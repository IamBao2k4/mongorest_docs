import {
    RbacJson,
    RbacCollection,
    RbacRolePattern,
    RbacPattern
} from './rbac-interface'
import * as fs from 'fs';
import * as path from 'path';


export class RbacValidator {
    private static rbacJson: RbacJson;

    public loadConfig() {
        const filePath = path.join(__dirname, '../../schemas/rbac/mongorestrbacjson.json');
        const raw = fs.readFileSync(filePath, 'utf-8');
        RbacValidator.rbacJson = JSON.parse(raw);
    }

    private static hasUserRole(role: RbacRolePattern[], userRoles: string): boolean {
        return role.some(r => r.user_role === userRoles);
    }

    public hasAccess(collection: string, action: string, userRoles: string[]): boolean {
        const rbacCollection: RbacCollection | undefined = RbacValidator.rbacJson.collections.find((col: RbacCollection) => col.collection_name === collection);

        if (!rbacCollection) {
            return false; // Collection not found
        }

        const collectionAction: RbacRolePattern[] = action === 'read' ? rbacCollection.rbac_config.read : action === 'write' ? rbacCollection.rbac_config.write : rbacCollection.rbac_config.delete;

        return userRoles.some(role =>
            RbacValidator.hasUserRole(collectionAction, role)
        );
    }

    public static getRbacFeatures(collection: string, action: string, userRoles: string[], isRelate: boolean = false, layer: number = 1, pre_fieldName? : string): string[] {

        if(layer > 2) {
            return [];
        }

        const rbacCollection: RbacCollection = RbacValidator.rbacJson.collections.find((col: RbacCollection) => col.collection_name === collection)!;

        if (!rbacCollection) {
            throw new Error(`Collection ${collection} not found in RBAC configuration.`);
        }

        const collectionAction: RbacRolePattern[] = action === 'read' ? rbacCollection.rbac_config.read : action === 'write' ? rbacCollection.rbac_config.write : rbacCollection.rbac_config.delete;

        let features: Set<string> = new Set<string>();

        userRoles.forEach(role => {
            if (RbacValidator.hasUserRole(collectionAction, role)) {
                const rolePatterns : RbacPattern[] | undefined = collectionAction.find(r => r.user_role === role)?.patterns;
                if (!rolePatterns) {
                    console.warn(`No patterns found for role ${role} in collection ${collection} for action ${action}.`);
                }

                rolePatterns?.forEach(pattern => {
                    const fieldName = Object.keys(pattern)[0];

                    const typeValue = pattern[fieldName].type;

                    if (typeValue === 'field') {
                        features.add(isRelate ? (pre_fieldName + "." + fieldName) : fieldName); ;
                    } else {
                        const relate_collection = pattern[fieldName].relate_collection;
                        const rbacFeatures = RbacValidator.getRbacFeatures(
                            relate_collection, 
                            action, 
                            userRoles, 
                            true, 
                            layer + (collection === relate_collection ? 1 : 0), 
                            pre_fieldName ? (pre_fieldName + "." + fieldName) : fieldName
                        );
                        rbacFeatures.length > 0 ? rbacFeatures.forEach(feature => {
                            features.add(feature);
                        }) : {};
                    }
                });
            }
        });
        const data : string[] =  Array.from(features).sort((a, b) => a.localeCompare(b));

        let pre_field: string = "";

        return data.map(feature => {
            if (pre_field === "") {
                pre_field = feature;
                return feature;
            }
            if( feature.startsWith(pre_field) ) {
                return undefined;
            }
            else {
                pre_field = feature;
                return feature;
            }
        }).filter(feature => feature !== undefined && feature !== null);
    }

    public static filterRbacFeatures(
        collection: string, 
        action: string, 
        userRoles: string[], 
        features: string[]
    ): string[] {
        const rbacCollection: RbacCollection = RbacValidator.rbacJson.collections.find((col: RbacCollection) => col.collection_name === collection)!;

        if (!rbacCollection) {
            throw new Error(`Collection ${collection} not found in RBAC configuration.`);
        }

        const collectionAction: RbacRolePattern[] = action === 'read' ? rbacCollection.rbac_config.read : action === 'write' ? rbacCollection.rbac_config.write : rbacCollection.rbac_config.delete;

        return features.filter(feature => {
            return userRoles.some(role => {
                return RbacValidator.hasUserRole(collectionAction, role) && 
                    collectionAction.some(r => r.user_role === role && r.patterns.some(p => Object.keys(p)[0] === feature));
            });
        });
    }
}