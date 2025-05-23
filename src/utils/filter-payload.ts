import { isMongoId } from "class-validator";
import { HttpError } from "./http-error";
import { appSettings } from "../configs/app-settings";

export function filterData(jsonSchema: any, body: any, is_update: boolean = false): any {
    const filteredData: any = {};
    // Hàm để duyệt qua các thuộc tính trong json schema và xử lý từng thuộc tính
    const processSchema = (schema: any, data: any, output: any) => {
        const requiredFields = schema.required || []; // Lấy danh sách các field required từ schema
        // Kiểm tra tất cả các field bắt buộc and have no default value
        if (!is_update) {
            requiredFields.forEach((requiredField: string) => {
                if (!schema.properties[requiredField].default && !(schema.properties[requiredField].widget === 'boolean')) {
                    if (data[requiredField] === undefined || data[requiredField] === null) {
                        throw new HttpError(`Field "${requiredField}" is required but missing.`, 400);
                    }
                    if (typeof data[requiredField] === 'string' && data[requiredField].trim() === '') {
                        throw new HttpError(`Field "${requiredField}" is required but missing.`, 400);
                    }
                    if (Array.isArray(data[requiredField]) && data[requiredField].length === 0) {
                        throw new HttpError(`Field "${requiredField}" is required but missing.`, 400);
                    }
                    if (typeof data[requiredField] === 'object' && !Array.isArray(data[requiredField]) && Object.keys(data[requiredField]).length === 0) {
                        throw new HttpError(`Field "${requiredField}" is required but missing.`, 400);
                    }
                }
            });
        }

        Object.keys(schema.properties).forEach((key) => {
            const fieldSchema = schema.properties[key];
            let value = data[key];
            // Nếu giá trị tồn tại trong body
            if (
                (value !== undefined && value !== null)
                || fieldSchema.type === 'object'
                || fieldSchema.default
                || fieldSchema.type === 'boolean' // tại default bọn này là 0 và false => :>>>
                || fieldSchema.widget === 'numberInput'
            ) {
                // Nếu là object, xử lý đệ quy
                if (fieldSchema.type === 'object' && fieldSchema.properties) {
                    output[key] = {};
                    if (!value) {
                        value = {};
                    }
                    processSchema(fieldSchema, value, output[key]);
                } else if (fieldSchema.widget === 'select') {
                    // Nếu widget là select, kiểm tra xem giá trị có hợp lệ không
                    const validChoices = fieldSchema.choices.map((choice: any) => choice.value);
                    if (fieldSchema.default && !value && !is_update) {
                        if (!validChoices.includes(fieldSchema.default)) {
                            throw new Error(`Invalid default value for field "${key}". Expected one of: ${validChoices.join(', ')}`);
                        }
                        output[key] = [fieldSchema.default];
                    } else {
                        if (fieldSchema.isMultiple) {
                            // Nếu là multiple, kiểm tra từng phần tử
                            let value_term = value;
                            if (!value_term && is_update) {
                                // do nothing
                            } else {
                                if (!Array.isArray(value)) {
                                    // convert to array
                                    value_term = [value];
                                }
                                const invalidValues = value_term.filter((v: any) => !validChoices.includes(v));
                                if (invalidValues.length > 0) {
                                    throw new Error(`Invalid value for field "${key}". Expected one of: ${validChoices.join(', ')}`);
                                }
                                output[key] = value_term;
                            }
                        } else if (!fieldSchema.isMultiple) {
                            if (Array.isArray(value)) {
                                if (value.length > 1) throw new HttpError(`Invalid value for field "${key}". Expected a single value.`, 400);
                                value = value[0];
                            }
                            if (!validChoices.includes(value) && !is_update) {
                                throw new Error(`Invalid value for field "${key}". Expected one of: ${validChoices.join(', ')}`);
                            } else if (!validChoices.includes(value) && is_update) {
                                // do nothing
                            } else {
                                output[key] = [value];
                            }
                        }
                    }
                } else if (fieldSchema?.widget == 'file') {
                    if (!value) {
                        output[key] = [];
                    } else if (!Array.isArray(value)) {
                        output[key] = [value];
                    } else {
                        output[key] = value;
                    }
                    // check value is mongoDB id
                    for (let i = 0; i < output[key].length; i++) {
                        if (!isMongoId(output[key][i])) {
                            throw new Error(`Invalid value for field "${key}". Expected a valid MongoDB ID.`);
                        }
                    }
                } else if (fieldSchema?.widget?.includes('date')) {
                    output[key] = new Date(appSettings.timeZoneMongoDB.getCustomTime(value));
                } else if (fieldSchema.widget === 'boolean') {
                    if (value == undefined && value == null && !is_update) {
                        output[key] = fieldSchema.default;
                    } else if (value !== undefined && value !== null) {
                        if (typeof value == 'string' && value == 'false') {
                            output[key] = false;
                        } else {
                            output[key] = value ? true : false;
                        }
                    }
                } else if (fieldSchema.widget === 'numberInput') {
                    if (isNaN(value) && isNaN(fieldSchema.default) && requiredFields.includes(key)) {
                        throw new Error(`Invalid value for field "${key}". Expected a number.`);
                    } else if (!is_update && !isNaN(fieldSchema.default) && isNaN(value)) {
                        output[key] = Number(fieldSchema.default);
                    } else if (!isNaN(value)) {
                        output[key] = Number(value);
                    }
                } else if (
                    fieldSchema.widget === 'shortAnswer' ||
                    fieldSchema.widget === 'textarea' ||
                    fieldSchema.widget === 'UriKeyGen' ||
                    fieldSchema.widget === 'color'
                ) {
                    // Nếu là string, kiểm tra giá trị có phải là chuỗi không
                    if (typeof value !== 'string' && value !== null) {
                        throw new Error(`Invalid value for field "${key}". Expected a string. Actual: ${typeof value}`);
                    }
                    output[key] = value;
                } else {
                    // Chỉ thêm giá trị hợp lệ vào output mà không cần validate
                    output[key] = value;
                }
            }
        });

        // Xử lý dependencies
        if (schema.dependencies) {
            Object.keys(schema.dependencies).forEach((dependentField) => {
                // Lấy giá trị của trường phụ thuộc từ dữ liệu đầu vào
                const dependentValue = data[dependentField];
                // Nếu không có giá trị cho trường phụ thuộc, không cần xử lý dependencies
                if (dependentValue === undefined || dependentValue === null) {
                    return;
                }
                // Lấy thông tin dependencies
                const dependency = schema.dependencies[dependentField];
                // Xử lý dependencies có oneOf
                if (dependency.oneOf) {
                    let matchedSchema = null;
                    let additionalRequiredFields: string[] = [];
                    let allDependentFields: Set<string> = new Set();
                    // Thu thập tất cả các trường phụ thuộc từ tất cả các variants
                    dependency.oneOf.forEach((variant: any) => {
                        Object.keys(variant.properties).forEach(propKey => {
                            if (propKey !== dependentField) {
                                allDependentFields.add(propKey);
                            }
                        });
                    });
                    // Tìm schema phù hợp với giá trị của trường phụ thuộc
                    for (const variant of dependency.oneOf) {
                        // Kiểm tra xem giá trị của trường phụ thuộc có nằm trong enum của variant không
                        if (variant.properties[dependentField] &&
                            variant.properties[dependentField].enum &&
                            variant.properties[dependentField].enum.includes(dependentValue)) {
                            matchedSchema = variant;
                            // Lấy danh sách các trường bắt buộc bổ sung nếu có
                            additionalRequiredFields = variant.required || [];
                            // Đặt tất cả các trường phụ thuộc không liên quan thành null
                            allDependentFields.forEach(fieldName => {
                                if (!variant.properties[fieldName]) {
                                    output[fieldName] = null;
                                }
                            });
                            // Xử lý các thuộc tính bổ sung
                            Object.keys(variant.properties).forEach((propKey) => {
                                // Bỏ qua trường đã xử lý
                                if (propKey === dependentField) {
                                    return;
                                }
                                const propSchema = variant.properties[propKey];
                                const propValue = data[propKey];
                                // Kiểm tra trường có bắt buộc không và có giá trị không
                                if (
                                    additionalRequiredFields.includes(propKey) &&
                                    (propValue === undefined || propValue === null) &&
                                    !is_update
                                ) {
                                    throw new HttpError(
                                        `Field "${propKey}" is required when "${dependentField}" is "${dependentValue}".`,
                                        400
                                    );
                                }
                                // Xử lý giá trị cho trường phụ thuộc
                                if (propValue !== undefined && propValue !== null) {
                                    // Xử lý các kiểu widget khác nhau

                                    // Xử lý các widget relation
                                    if (propSchema.widget === 'relation') {
                                        // Xử lý relation với typeSelect multiple
                                        if (propSchema.typeSelect === 'multiple') {
                                            if (!Array.isArray(propValue)) {
                                                output[propKey] = [propValue];
                                            } else {
                                                output[propKey] = propValue;
                                            }

                                            // Kiểm tra tính hợp lệ của từng giá trị trong mảng
                                            output[propKey].forEach((val: any) => {
                                                if (!isMongoId(val)) {
                                                    throw new Error(`Invalid relation ID for field "${propKey}". Expected a valid MongoDB ID.`);
                                                }
                                            });
                                        } else {
                                            // Xử lý relation không multiple
                                            if (Array.isArray(propValue)) {
                                                if (propValue.length > 1) {
                                                    throw new HttpError(
                                                        `Invalid value for field "${propKey}". Expected a single value.`,
                                                        400
                                                    );
                                                }
                                                output[propKey] = propValue[0];
                                            } else {
                                                output[propKey] = propValue;
                                            }

                                            // Kiểm tra tính hợp lệ của ID
                                            if (!isMongoId(output[propKey])) {
                                                throw new Error(`Invalid relation ID for field "${propKey}". Expected a valid MongoDB ID.`);
                                            }
                                        }
                                    } else if (propSchema.widget === 'shortAnswer' || propSchema.widget === 'textarea') {
                                        // Kiểm tra giá trị là chuỗi
                                        if (typeof propValue !== 'string') {
                                            throw new Error(`Invalid value for field "${propKey}". Expected a string.`);
                                        }
                                        output[propKey] = propValue;
                                    } else {
                                        output[propKey] = propValue;
                                    }
                                } else {
                                    // Nếu không có giá trị nhưng trường này thuộc về schema phù hợp, đặt giá trị là null
                                    output[propKey] = null;
                                }
                            });

                            break;
                        }
                    }
                    // Nếu không có schema phù hợp
                    // if (!matchedSchema) {
                    //     throw new HttpException(
                    //         `Invalid value "${dependentValue}" for field "${dependentField}".`,
                    //         HttpStatus.BAD_REQUEST
                    //     );
                    // }
                }
            });
        }

        // Xử lý allOf - BỔ SUNG MỚI
        if (schema.allOf) {
            // Xử lý từng điều kiện trong allOf
            schema.allOf.forEach((condition: any, index: number) => {
                // Xử lý điều kiện if-then
                if (condition.if && condition.then) {
                    // Kiểm tra xem dữ liệu có thỏa mãn điều kiện "if" không
                    let conditionMet = true;
                    
                    // Lấy điều kiện từ phần "if"
                    const ifCondition = condition.if;
                    
                    // Kiểm tra điều kiện properties
                    if (ifCondition.properties) {
                        Object.keys(ifCondition.properties).forEach(propKey => {
                            const propCondition = ifCondition.properties[propKey];
                            const propValue = data[propKey];
                            
                            // Kiểm tra điều kiện contains (thường dùng cho mảng)
                            if (propCondition.contains) {
                                // Nếu là điều kiện "contains" trong mảng
                                if (Array.isArray(propValue)) {
                                    // Kiểm tra xem mảng có chứa giá trị cần thiết không
                                    if (propCondition.contains.const) {
                                        const constValue = propCondition.contains.const;
                                        if (!propValue.includes(constValue)) {
                                            conditionMet = false;
                                        }
                                    }
                                } else {
                                    // Nếu không phải mảng nhưng yêu cầu điều kiện contains
                                    conditionMet = false;
                                }
                            }
                            // Có thể thêm các kiểu điều kiện khác tùy theo schema
                        });
                    }
                    
                    // Nếu điều kiện được thỏa mãn, áp dụng phần "then"
                    if (conditionMet) {
                        const thenSchema = condition.then;
                        // Áp dụng các thuộc tính và yêu cầu từ phần "then"
                        if (thenSchema.properties) {
                            Object.keys(thenSchema.properties).forEach(propKey => {
                                // Thêm thuộc tính vào đầu ra nếu nó không tồn tại
                                if (!output[propKey] && data[propKey] !== undefined) {
                                    // Xử lý giá trị dựa trên loại widget
                                    const propSchema = thenSchema.properties[propKey];
                                    const propValue = data[propKey];
                                    
                                    // Xử lý các loại widget khác nhau
                                    if (propSchema.widget === 'select') {
                                        // Xử lý tương tự như phần xử lý select ở trên
                                        const validChoices = propSchema.choices?.map((choice: any) => choice.value) || [];
                                        
                                        if (propSchema.isMultiple) {
                                            let value_term = propValue;
                                            if (!value_term && is_update) {
                                                // do nothing
                                            } else {
                                                if (!Array.isArray(propValue)) {
                                                    value_term = [propValue];
                                                }
                                                const invalidValues = value_term.filter((v: any) => !validChoices.includes(v));
                                                if (invalidValues.length > 0) {
                                                    throw new Error(`Invalid value for field "${propKey}". Expected one of: ${validChoices.join(', ')}`);
                                                }
                                                output[propKey] = value_term;
                                            }
                                        } else {
                                            let singleValue = propValue;
                                            if (Array.isArray(propValue)) {
                                                if (propValue.length > 1) throw new HttpError(`Invalid value for field "${propKey}". Expected a single value.`, 400);
                                                singleValue = propValue[0];
                                            }
                                            if (!validChoices.includes(singleValue) && !is_update) {
                                                throw new Error(`Invalid value for field "${propKey}". Expected one of: ${validChoices.join(', ')}`);
                                            } else if (!validChoices.includes(singleValue) && is_update) {
                                                // do nothing
                                            } else {
                                                output[propKey] = [singleValue];
                                            }
                                        }
                                    } else if (propSchema.widget === 'numberInput') {
                                        // Xử lý tương tự như phần xử lý numberInput ở trên
                                        if (isNaN(propValue) && thenSchema.required?.includes(propKey)) {
                                            throw new Error(`Invalid value for field "${propKey}". Expected a number.`);
                                        } else if (!is_update && !isNaN(propSchema.default) && isNaN(propValue)) {
                                            output[propKey] = Number(propSchema.default);
                                        } else if (!isNaN(propValue)) {
                                            output[propKey] = Number(propValue);
                                        }
                                    } else if (propSchema.widget === 'boolean') {
                                        // Xử lý tương tự như phần xử lý boolean ở trên
                                        if (propValue === undefined && propValue === null && !is_update) {
                                            output[propKey] = propSchema.default;
                                        } else if (propValue !== undefined && propValue !== null) {
                                            if (typeof propValue == 'string' && propValue == 'false') {
                                                output[propKey] = false;
                                            } else {
                                                output[propKey] = propValue ? true : false;
                                            }
                                        }
                                    } else {
                                        // Xử lý các widget khác
                                        output[propKey] = propValue;
                                    }
                                }
                            });
                        }
                        
                        // Kiểm tra các trường required từ phần "then"
                        if (thenSchema.required && !is_update) {
                            thenSchema.required.forEach((requiredField: string) => {
                                if (data[requiredField] === undefined || data[requiredField] === null) {
                                    throw new HttpError(
                                        `Field "${requiredField}" is required based on condition ${index + 1}.`,
                                        400
                                    );
                                }
                            });
                        }
                    } 
                } else {
                    // Xử lý trường hợp allOf schema là schema bình thường mà không phải if-then
                    // Thực hiện xác thực dữ liệu theo schema này
                    // Merge các thuộc tính và kiểm tra tính hợp lệ
                    if (condition.properties) {
                        Object.keys(condition.properties).forEach(propKey => {
                            const propSchema = condition.properties[propKey];
                            const propValue = data[propKey];
                            
                            // Kiểm tra tính hợp lệ của dữ liệu
                            if (propValue !== undefined && propValue !== null) {
                                // Xử lý giá trị trường này dựa trên loại widget
                                // Logic tương tự như xử lý trường ở trên
                                // Thêm giá trị vào output nếu chưa tồn tại
                                if (output[propKey] === undefined) {
                                    output[propKey] = processFieldValue(propKey, propSchema, propValue, is_update);
                                }
                            }
                        });
                        
                        // Kiểm tra các trường required
                        if (condition.required && !is_update) {
                            condition.required.forEach((requiredField: string) => {
                                if (data[requiredField] === undefined || data[requiredField] === null) {
                                    throw new HttpError(
                                        `Field "${requiredField}" is required based on schema condition.`,
                                       400
                                    );
                                }
                            });
                        }
                    }
                }
            });
        }
    };

    // Hàm hỗ trợ xử lý giá trị trường
    const processFieldValue = (fieldKey: string, fieldSchema: any, fieldValue: any, isUpdate: boolean): any => {
        // Logic xử lý các loại widget khác nhau
        // Trả về giá trị đã xử lý
        if (fieldSchema.widget === 'select') {
            const validChoices = fieldSchema.choices?.map((choice: any) => choice.value) || [];
            
            if (fieldSchema.isMultiple) {
                if (!Array.isArray(fieldValue)) {
                    return [fieldValue];
                } else {
                    return fieldValue;
                }
            } else {
                if (Array.isArray(fieldValue)) {
                    if (fieldValue.length > 1) {
                        throw new HttpError(
                            `Invalid value for field "${fieldKey}". Expected a single value.`,
                            400
                        );
                    }
                    return [fieldValue[0]];
                } else {
                    return [fieldValue];
                }
            }
        } else if (fieldSchema.widget === 'numberInput') {
            return Number(fieldValue);
        } else if (fieldSchema.widget === 'boolean') {
            if (typeof fieldValue === 'string' && fieldValue === 'false') {
                return false;
            } else {
                return fieldValue ? true : false;
            }
        } else {
            return fieldValue;
        }
    };
    
    // Bắt đầu xử lý schema với body request
    processSchema(jsonSchema, body, filteredData);
    return filteredData;
}

// "json_schema": {
//     "type": "object",
//     "properties": {
//       "newInput1": {
//         "title": "New Input 1",
//         "type": "string",
//         "widget": "select",
//         "choices": [
//           {
//             "key": "oke1",
//             "value": "OKE1"
//           },
//           {
//             "key": "oke2",
//             "value": "OKE2"
//           }
//         ]
//       }
//     },
//     "required": []
//   },

// "json_schema": {
//     "title": "post-type",
//     "type": "object",
//     "description": "post-type",
//     "expanded": true,
//     "properties": {
//       "title": {
//         "title": "title",
//         "type": "string",
//         "widget": "shortAnswer",
//         "expanded": true,
//         "require": false,
//         "filter": true,
//         "objectKey": "title"
//       },
//       "slug": {
//         "widget": "UriKeyGen",
//         "title": "slug",
//         "type": "string",
//         "filter": true,
//         "depend_field": "root_title"
//       },
//       "locale": {
//         "widget": "select",
//         "returnValue": 2,
//         "choices": [
//           {
//             "key": "vi",
//             "value": "vi"
//           },
//           {
//             "key": "en",
//             "value": "en"
//           }
//         ],
//         "default": "vi",
//         "allowNull": false,
//         "isMultiple": false,
//         "title": "locale",
//         "type": "string",
//         "filter": true
//       },
//       "locale_id": {
//         "title": "locale_id",
//         "type": "string",
//         "widget": "shortAnswer",
//         "objectKey": "locale_id",
//         "filter": true
//       }
//     },
//     "form": {
//       "json": "{\"title\":\"post-type\",\"type\":\"object\",\"description\":\"post-type\",\"expanded\":true,\"properties\":{\"newInput1\":{\"title\":\"title\",\"type\":\"string\",\"widget\":\"shortAnswer\",\"expanded\":true,\"require\":false},\"newInput2\":{\"title\":\"slug\",\"type\":\"object\",\"expanded\":true},\"newInput3\":{\"title\":\"locale\",\"type\":\"object\"},\"newInput4\":{\"title\":\"locale_id\",\"type\":\"object\"}}}",
//       "ui": "{\"newInput1\":{\"ui:widget\":\"shortAnswer\"},\"ui:order\":[\"newInput1\",\"newInput2\",\"newInput3\",\"newInput4\"]}"
//     },
//     "required": [
//       "title",
//       "slug",
//       "locale"
//     ],
//     "dependencies": {}
//   }