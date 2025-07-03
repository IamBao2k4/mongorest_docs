import { Filter } from 'mongodb';
import { FilterQuery } from 'mongoose';

export function buildFilter(tenant_id?: string) {
    let filter: Filter<any> & FilterQuery<any> = {};
    if (tenant_id) filter.tenant_id = tenant_id;
    return filter;
}