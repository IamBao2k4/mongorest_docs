// Get populate fields from schema
export async function getRelationFields(schema: any, parentPath = "") {
    const relations: string[] = [];
    function findRelations(obj: any, path: string) {
        if (!obj || typeof obj !== 'object') return;
        Object.entries(obj).forEach(([key, value]: [string, any]) => {
            let currentPath = path ? `${path}@${key}` : key;
            if (value.type === "relation") {
                currentPath = `${currentPath},${value.entity}`;
                relations.push(currentPath);
            }
            if (value.type === "object") {
                findRelations(value.items || value, currentPath);
            }
        });
    }
    findRelations(schema.items, "");
    return relations;
}

// use this function to generate aggregation pipeline by return of getRelationFields
export async function generateAggregationPipeline(mappings: string[]) {
    const addFieldsStage: any = { $addFields: {} };
    const lookupStages: any[] = [];
    const finalAddFieldsStage: any = { $addFields: {} };
    const unsetFields: string[] = [];

    mappings.forEach((mapping) => {
        const [sourcePath, targetCollection] = mapping.split(",");
        if (sourcePath.includes("@")) {
            // Example: "permission@entity,entity"
            const [arrayField, nestedField] = sourcePath.split("@"); // arrayField: "permission", nestedField: "entity"

            // Stage 1: Convert the values in the nested field to ObjectId.
            // If the value of the nested field is a string, convert it to an array first.
            addFieldsStage.$addFields[arrayField] = {
                $map: {
                    input: `$${arrayField}`,
                    as: "item",
                    in: {
                        [nestedField]: {
                            $map: {
                                input: {
                                    $cond: {
                                        if: { $eq: [{ $type: `$$item.${nestedField}` }, "string"] },
                                        then: [`$$item.${nestedField}`],
                                        else: `$$item.${nestedField}`
                                    }
                                },
                                as: "id",
                                in: { $toObjectId: "$$id" }
                            }
                        },
                        // Keep other fields if any
                        filter: "$$item.filter",
                        access_field: "$$item.access_field"
                    }
                }
            };

            // Stage 2: Lookup for the array field
            const alias = `${targetCollection}_data`; // example: "entity_data"
            lookupStages.push({
                $lookup: {
                    from: targetCollection,
                    localField: `${arrayField}.${nestedField}`,
                    foreignField: "_id",
                    as: alias
                }
            });

            // Stage 3: Remap the looked-up elements for the array field
            finalAddFieldsStage.$addFields[arrayField] = {
                $map: {
                    input: `$${arrayField}`,
                    as: "item",
                    in: {
                        [nestedField]: {
                            $map: {
                                input: `$$item.${nestedField}`,
                                as: "id",
                                in: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: `$${alias}`,
                                                as: "obj",
                                                cond: { $eq: ["$$obj._id", "$$id"] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        },
                        filter: "$$item.filter",
                        access_field: "$$item.access_field"
                    }
                }
            };

            unsetFields.push(alias);
        } else {
            // Example: "created_by,user"
            // Stage 1: For single fields, check if it's a string then convert it to an array before converting to ObjectId.
            addFieldsStage.$addFields[sourcePath] = {
                $let: {
                    vars: {
                        arr: {
                            $cond: {
                                if: { $eq: [{ $type: `$${sourcePath}` }, "string"] },
                                then: [`$${sourcePath}`],
                                else: `$${sourcePath}`
                            }
                        }
                    },
                    in: {
                        $map: {
                            input: "$$arr",
                            as: "id",
                            in: { $toObjectId: "$$id" }
                        }
                    }
                }
            };


            // Stage 2: Lookup for single field
            const alias = `${sourcePath}_data`;
            lookupStages.push({
                $lookup: {
                    from: targetCollection,
                    localField: sourcePath,
                    foreignField: "_id",
                    as: alias
                }
            });

            // Stage 3: Remap single field (take the first element)
            finalAddFieldsStage.$addFields[sourcePath] = `$${alias}`;

            unsetFields.push(alias);
        }
    });

    const pipeline: any[] = [];
    if (Object.keys(addFieldsStage.$addFields).length > 0) {
        pipeline.push({ $addFields: addFieldsStage.$addFields });
    }
    pipeline.push(...lookupStages);
    if (Object.keys(finalAddFieldsStage.$addFields).length > 0) {
        pipeline.push({ $addFields: finalAddFieldsStage.$addFields });
    }
    if (unsetFields.length > 0) {
        pipeline.push({ $unset: unsetFields });
    }
    return pipeline;
};
