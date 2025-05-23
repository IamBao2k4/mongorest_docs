// get populate fields from schema
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
            // Ví dụ: "permission@entity,entity"
            const [arrayField, nestedField] = sourcePath.split("@"); // arrayField: "permission", nestedField: "entity"

            // Stage 1: Chuyển đổi các giá trị trong nested field sang ObjectId.
            // Nếu giá trị của nested field là string, chuyển thành mảng trước.
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
                        // Giữ lại các trường khác nếu có
                        filter: "$$item.filter",
                        access_field: "$$item.access_field"
                    }
                }
            };

            // Stage 2: Lookup cho trường mảng
            const alias = `${targetCollection}_data`; // ví dụ: "entity_data"
            lookupStages.push({
                $lookup: {
                    from: targetCollection,
                    localField: `${arrayField}.${nestedField}`,
                    foreignField: "_id",
                    as: alias
                }
            });

            // Stage 3: Ánh xạ lại các phần tử đã lookup cho trường mảng
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
            // Ví dụ: "created_by,user"
            // Stage 1: Với field đơn, kiểm tra nếu là string thì chuyển thành mảng trước khi convert sang ObjectId.
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


            // Stage 2: Lookup cho field đơn
            const alias = `${sourcePath}_data`;
            lookupStages.push({
                $lookup: {
                    from: targetCollection,
                    localField: sourcePath,
                    foreignField: "_id",
                    as: alias
                }
            });

            // Stage 3: Ánh xạ lại field đơn (lấy phần tử đầu tiên)
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
