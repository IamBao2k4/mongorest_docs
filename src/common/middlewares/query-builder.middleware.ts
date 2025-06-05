import { FastifyRequest, FastifyReply } from 'fastify';
import { FilterQuery, PipelineStage } from "mongoose";
import { ObjectId } from 'mongodb';

export class ResultHandleSearch {
    filterQuery: FilterQuery<any> = {};
    sortQuery: Record<string, 1 | -1> = {};
    projection: Record<string, any> = {};
    aggregationPipeline: PipelineStage[] = [];
}

export function handleSearch(queryParams: any): ResultHandleSearch {
    const filterQuery: FilterQuery<any> = {};
    const sortQuery: Record<string, 1 | -1> = {};
    const projection: Record<string, any> = {};
    const aggregationPipeline: PipelineStage[] = [];    

    // Chuyển đổi tham số từ dạng 'projection[title]=1': '' sang 'projection[title]': '${number}'
    // Chuyển đổi tham số từ dạng 'sort/[created_at/]=oke' sang 'sort[created_at]': 'oke'
    Object.keys(queryParams).forEach((key) => {
        let new_key = key.replace(/\\/g, '');
        queryParams[new_key] = queryParams[key];
        // remove old key
        if(new_key !== key) delete queryParams[key];     
        if (new_key.includes('=')) {
            const arr = new_key.split('=');
            queryParams[arr[0]] = arr[1];
            // remove old key
            delete queryParams[new_key];
        }
    });

    // check sort by created_at is exit if not add default sort by created_at
    if (!queryParams['sort[created_at]']) sortQuery['created_at'] = -1;

    // Xử lý các tham số tìm kiếm
    Object.keys(queryParams).forEach((key, value) => {
        if (key.startsWith('search[')) {
            const value = queryParams[key];
            const match = key.match(/^search\[(.+?)(:(.+))?\]$/);
            if (match) {
                const field = match[1];
                const operator = match[3] || '';
                if (operator === 'contains') {
                    const regexValue = value.replace(/%/g, '.*');
                    filterQuery[field] = { $regex: regexValue, $options: 'i' };
                } else if (operator === 'doesNotContain') {
                    const regexValue = value.replace(/%/g, '.*');
                    filterQuery[field] = { $not: { $regex: regexValue, $options: 'i' } };
                } else if (operator === 'in') {
                    if (field === '_id') {
                        filterQuery[field] = {
                            $in: value.split(',').map((v: any) => {
                                const trimmedValue = v.trim();
                                return ObjectId.isValid(trimmedValue) ? new ObjectId(trimmedValue) : trimmedValue;
                            })
                        };
                    } else {
                        filterQuery[field] = {
                            $in: value.split(',').map((v: any) => {
                                return v === 'null' ? null : v.trim();
                            })
                        };
                    }
                } else if (operator === 'nin') {
                    if (field === '_id') {
                        filterQuery[field] = {
                            $nin: value.split(',').map((v: any) => {
                                const trimmedValue = v.trim();
                                return ObjectId.isValid(trimmedValue) ? new ObjectId(trimmedValue) : trimmedValue;
                            })
                        };
                    } else {
                        filterQuery[field] = {
                            $nin: value.split(',').map((v: any) => {
                                return v === 'null' ? null : v.trim();
                            })
                        };
                    }
                } else if (operator === 'beginsWith') {
                    filterQuery[field] = { $regex: `^${value}`, $options: 'i' };
                } else if (operator === 'endsWith') {
                    filterQuery[field] = { $regex: `${value}$`, $options: 'i' };
                } else if (operator === 'range') {
                    const [min, max] = value.split(',').map((v: any) => parseFloat(v.trim()));
                    filterQuery[field] = { $gte: min, $lte: max };
                } else if (operator === 'exists') {
                    filterQuery[field] = { $exists: value === 'true' };
                } else if (operator === 'notExists') {
                    filterQuery[field] = { $exists: value === 'false' };
                } else if (operator === 'equal') {
                    if(field === '_id') {
                        filterQuery[field] = ObjectId.isValid(value) ? new ObjectId(value) : value;
                    } else {
                        filterQuery[field] = value;
                    }
                } else if (operator === 'notEqual') {
                    filterQuery[field] = { $ne: value };
                } else if (operator === 'gt') {
                    filterQuery[field] = { $gt: parseFloat(value) };
                } else if (operator === 'lt') {
                    filterQuery[field] = { $lt: parseFloat(value) };
                } else if (operator === 'gte') {
                    filterQuery[field] = { $gte: parseFloat(value) };
                } else if (operator === 'lte') {
                    filterQuery[field] = { $lte: parseFloat(value) };
                } else if (operator === 'notIn') {
                    filterQuery[field] = {
                        $nin: value.split(',').map((v: any) => v.trim()),
                    };
                } else if (operator === 'size') {
                    filterQuery[field] = { $size: parseInt(value, 10) };
                } else if (operator === 'all') {
                    filterQuery[field] = {
                        $all: value.split(',').map((v: any) => v.trim()),
                    };
                } else if (operator === 'elemMatch') {
                    filterQuery[field] = { $elemMatch: JSON.parse(value) };
                } else if (operator === 'between') {
                    const [startDate, endDate] = value.split(',');
                    if (!isNaN(startDate) && !isNaN(endDate)) {
                        filterQuery[field] = {
                            $gte: parseFloat(startDate),
                            $lte: parseFloat(endDate),
                        };
                    } else {
                        filterQuery[field] = {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate),
                        };
                    }
                } else if (operator === 'notBetween') {
                    const [startDate, endDate] = value.split(',');
                    if (!isNaN(startDate) && !isNaN(endDate)) {
                        filterQuery[field] = {
                            $lt: parseFloat(startDate),
                            $gt: parseFloat(endDate),
                        };
                    } else {
                        filterQuery[field] = {
                            $lt: new Date(startDate),
                            $gt: new Date(endDate),
                        };
                    }
                } else if (operator === 'null') {
                    filterQuery[field] = null;
                } else if (operator === 'notNull') {
                    filterQuery[field] = { $ne: null };
                } else {
                    filterQuery[field] = value.includes(',')
                        ? value.split(',').map((v: any) => v.trim())
                        : value;
                }
            }
        }

        if (key.startsWith('sort[')) {
            const value = queryParams[key];
            const match = key.match(/^sort\[(.+)]$/);
            if (match) {
                const field = match[1];
                const direction = value === 'desc' ? -1 : 1;
                sortQuery[field] = direction;
            }
        }

        if (key.startsWith('projection[')) {
            const value = queryParams[key];
            const match = key.match(/^projection\[(.+)]$/);
            if (match) {
                const field = match[1];
                projection[field] = parseInt(value, 10);
            }
        }
    });

    // Tạo pipeline cơ bản
    aggregationPipeline.push({ $match: filterQuery });

    // Helper function để thêm giai đoạn vào pipeline
    const addStageToPipeline = (stage: any) => {
        if (stage) {
            aggregationPipeline.push(stage);
        }
    };

    // Thêm giai đoạn sắp xếp
    addStageToPipeline(Object.keys(sortQuery).length > 0 ? { $sort: sortQuery } : null);

    // Thêm giai đoạn projection
    addStageToPipeline(Object.keys(projection).length > 0 ? { $project: projection } : null);

    // Thêm giai đoạn unwind nếu có
    addStageToPipeline(queryParams['unwind'] ? { $unwind: `$${queryParams['unwind']}` } : null);

    // Các giai đoạn nhóm dữ liệu
    const groupStages = [
        { key: 'sum', operation: { $sum: `$${queryParams['group[sum]']}` } },
        { key: 'count', operation: { $sum: 1 } },
        { key: 'count:list', operation: { $sum: 1 } },
        { key: 'avg', operation: { $avg: `$${queryParams['group[avg]']}` } },
        { key: 'max', operation: { $max: `$${queryParams['group[max]']}` } },
        { key: 'min', operation: { $min: `$${queryParams['group[min]']}` } },
    ];

    groupStages.forEach(({ key, operation }) => {
        if (queryParams[`group[${key}]`]) {
            const field = queryParams[`group[${key}]`];
            addStageToPipeline({
                $group: {
                    _id: `$${field}`,
                    group_name: { $first: `$${field}` },
                    ...(key.includes('count') ? { count: operation } : { [key]: operation }),
                    ...(key.includes('list') ? { list: { $push: '$$ROOT' } } : {}),
                }
            });
        }
    });

    // Xử lý các giai đoạn đặc biệt như $merge hoặc $out
    addStageToPipeline(queryParams['aggregation[merge]'] ? {
        $merge: { into: queryParams['aggregation[merge]'], whenMatched: 'merge' },
    } : null);

    addStageToPipeline(queryParams['aggregation[out]'] ? { $out: queryParams['aggregation[out]'] } : null);

    return { filterQuery, sortQuery, projection, aggregationPipeline };
}

// Middleware function for query building
export async function queryBuilderMiddleware(request: FastifyRequest, reply: FastifyReply) {
    try {
        // Process query parameters
        const queryResult = handleSearch(request.query || {});
        
        // Attach processed query data to request object
        request.queryData = queryResult;
        
        // Extract limit and skip from query parameters
        const queryParams = request.query as any;
        request.pagination = {
            limit: queryParams.limit ? Number(queryParams.limit) : undefined,
            skip: queryParams.skip ? Number(queryParams.skip) : undefined
        };
        
    } catch (error: any) {
        reply.status(400).send({
            error: 'Invalid query parameters',
            message: error.message
        });
        return;
    }
}

// Type declaration for FastifyRequest extension
declare module 'fastify' {
    interface FastifyRequest {
        queryData?: ResultHandleSearch;
        pagination?: {
            limit?: number;
            skip?: number;
        };
    }
}
