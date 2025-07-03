import { FilterQuery } from "mongoose";
import { ObjectId } from 'mongodb';

export class ResultHandleSearch {
    filterQuery: FilterQuery<any>;
    sortQuery: Record<string, 1 | -1>;
    projection: Record<string, any>;
}

export function handleSearch(queryParams: any): ResultHandleSearch {

    const filterQuery: FilterQuery<any> = {};
    const sortQuery: Record<string, 1 | -1> = {};
    const projection: Record<string, any> = {};

    // Chuyển đổi tham số từ dạng 'projection[title]=1': '' sang 'projection[title]': '${number}'
    // Chuyển đổi tham số từ dạng 'sort/[created_at/]=oke' sang 'sort[created_at]': 'oke'

    Object.keys(queryParams).forEach((key) => {
        let new_key = key.replace(/\\/g, '');
        queryParams[new_key] = queryParams[key];
        // remove old key
        if (new_key !== key) delete queryParams[key];
        if (new_key.includes('=')) {
            const arr = new_key.split('=');
            queryParams[arr[0]] = arr[1];
            // remove old key
            delete queryParams[new_key];
        }
    });

    // Xử lý các tham số tìm kiếm
    Object.keys(queryParams).forEach((key, value) => {
        if (key.startsWith('search[')) {
            const value = queryParams[key];
            const match = key.match(/^search\[(.+?)(:(.+))?\]$/);
            if (match) {
                const field = match[1];
                const operator = match[3] || '';
                if (operator === 'contains') {
                    // Tìm kiếm mẫu (pattern matching)
                    const regexValue = value.replace(/%/g, '.*');
                    filterQuery[field] = { $regex: regexValue, $options: 'i' };
                } else if (operator === 'doesNotContain') {
                    // Tìm kiếm không chứa
                    const regexValue = value.replace(/%/g, '.*');
                    filterQuery[field] = { $not: { $regex: regexValue, $options: 'i' } };
                } else if (operator === 'in') {
                    // check if field name is _id then convert value to ObjectId
                    if (field === '_id') {
                        filterQuery[field] = {
                            $in: value.split(',').map((v) => {
                                const trimmedValue = v.trim();
                                // Kiểm tra nếu là ObjectId hợp lệ, chuyển đổi, nếu không thì giữ nguyên
                                return ObjectId.isValid(trimmedValue) ? new ObjectId(trimmedValue) : trimmedValue;
                            })
                        };
                    } else {
                        filterQuery[field] = {
                            $in: value.split(',').map((v) => {
                                return v === 'null' ? null : v.trim();
                            })
                        };
                    }
                } else if (operator === 'beginsWith') {
                    // Tìm kiếm ký tự bắt đầu
                    filterQuery[field] = { $regex: `^${value}`, $options: 'i' };
                } else if (operator === 'endsWith') {
                    // Tìm kiếm ký tự kết thúc
                    filterQuery[field] = { $regex: `${value}$`, $options: 'i' };
                } else if (operator === 'range') {
                    // Tìm kiếm trong khoảng
                    const [min, max] = value
                        .split(',')
                        .map((v) => parseFloat(v.trim()));
                    filterQuery[field] = { $gte: min, $lte: max };
                } else if (operator === 'exists') {
                    // Tìm kiếm trường tồn tại
                    filterQuery[field] = { $exists: value === 'true' };
                } else if (operator === 'notExists') {
                    // Tìm kiếm trường không tồn tại
                    filterQuery[field] = { $exists: value === 'false' };
                } else if (operator === 'equal') {
                    if (value === 'true' || value === 'false') {
                        filterQuery[field] = value === 'true';
                    } else {
                        filterQuery[field] = value;
                    }
                } else if (operator === 'notEqual') {
                    // Tìm kiếm không bằng
                    filterQuery[field] = { $ne: value };
                } else if (operator === 'gt') {
                    // Tìm kiếm lớn hơn
                    filterQuery[field] = { $gt: parseFloat(value) };
                } else if (operator === 'lt') {
                    // Tìm kiếm nhỏ hơn
                    filterQuery[field] = { $lt: parseFloat(value) };
                } else if (operator === 'gte') {
                    // Tìm kiếm lớn hơn hoặc bằng
                    filterQuery[field] = { $gte: parseFloat(value) };
                } else if (operator === 'lte') {
                    // Tìm kiếm nhỏ hơn hoặc bằng
                    filterQuery[field] = { $lte: parseFloat(value) };
                } else if (operator === 'notIn') {
                    // Tìm kiếm không trong danh sách
                    filterQuery[field] = {
                        $nin: value.split(',').map((v) => v.trim()),
                    };
                } else if (operator === 'size') {
                    // Tìm kiếm kích thước mảng
                    filterQuery[field] = { $size: parseInt(value, 10) };
                } else if (operator === 'all') {
                    // Tìm kiếm tất cả các giá trị trong mảng
                    filterQuery[field] = {
                        $all: value.split(',').map((v) => v.trim()),
                    };
                } else if (operator === 'elemMatch') {
                    // Tìm kiếm phần tử trong mảng phù hợp với tiêu chí
                    filterQuery[field] = { $elemMatch: JSON.parse(value) };
                } else if (operator === 'between') {
                    const [startDate, endDate] = value.split(',');
                    if (
                        // check is number
                        !isNaN(startDate) && !isNaN(endDate)
                    ) {
                        filterQuery[field] = {
                            $gte: parseFloat(startDate),
                            $lte: parseFloat(endDate),
                        };
                    }
                    else {
                        filterQuery[field] = {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate),
                        };
                    }
                } else if (operator === 'notBetween') {
                    const [startDate, endDate] = value.split(',');
                    if (
                        // check is number
                        !isNaN(startDate) && !isNaN(endDate)
                    ) {
                        filterQuery[field] = {
                            $lt: parseFloat(startDate),
                            $gt: parseFloat(endDate),
                        };
                    }
                    else {
                        filterQuery[field] = {
                            $lt: new Date(startDate),
                            $gt: new Date(endDate),
                        };
                    }
                } else if (operator === 'null') {
                    // Tìm kiếm trường null
                    filterQuery[field] = null;
                } else if (operator === 'notNull') {
                    // Tìm kiếm trường không null
                    filterQuery[field] = { $ne: null };
                } else {
                    // Tìm kiếm chính xác
                    filterQuery[field] = value.includes(',')
                        ? value.split(',').map((v) => v.trim())
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
                projection[field] = parseInt(value, 10); // Chuyển đổi giá trị thành số nguyên
            }
        }

    });

    if (!queryParams['sort[created_at]']) sortQuery['created_at'] = -1;

    console.log('tool search 1', { filterQuery, sortQuery, projection });

    return { filterQuery, sortQuery, projection };

}