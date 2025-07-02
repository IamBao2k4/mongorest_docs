import { isMongoId } from "class-validator";
import { HttpError } from "./http-error";
import { Schema } from "./check-required-field";

export const checkRelationFields = (data: any, schema: Schema) => {
    const relationFieldsWrongValueLenght: string[] = [];
    const checkFields = (data: any, schemaItems: Record<string, any>, path: string[] = []) => {
        for (const key in schemaItems) {
            if (schemaItems[key].type === 'relation' && data[key]) {
                if (Array.isArray(data[key]) === false) {
                    throw new HttpError(`Field ${[...path, key].join('.')} is not array`, 400);
                }
                for(let i = 0; i < data[key].length; i++) {
                    if (isMongoId(data[key][i]) === false) {
                        throw new HttpError(`Field ${[...path, key].join('.')} is not ObjectId`, 400);
                    }
                }
                const relation_type = schemaItems[key].relation_type;
                switch (relation_type) {
                    case '1-1':
                        if (data[key].length != 1) {
                            relationFieldsWrongValueLenght.push(`${[...path, key].join('.')}, type: ${relation_type}`);
                        }
                        break;
                    case '1-n':
                        if (data[key].length != 0) {
                            relationFieldsWrongValueLenght.push(`${[...path, key].join('.')}, type: ${relation_type}`);
                        }
                        break;
                    case 'n-1':
                        break;
                    case 'n-n':
                        if (data[key].length != 0) {
                            relationFieldsWrongValueLenght.push(`${[...path, key].join('.')}, type: ${relation_type}`);
                        }
                        break;
                    default:
                        break;
                }
            } else if(schemaItems[key].type === 'object' && schemaItems[key].items && schemaItems[key].is_array && data[key]) {
                for (let i = 0; i < data[key].length; i++) {
                    checkFields(data[key][i], schemaItems[key].items, [...path, key]);
                }
            }
        }
    };
    checkFields(data, schema.items);
    return relationFieldsWrongValueLenght;
};