import { FilterQuery, Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

export interface PaginatedResult<T> {
    limit: number;
    skip: number;
    documents: T[];
    count: number;
}

@Injectable()
export class BaseService<T> {

    constructor(
        protected readonly model: Model<T>,
    ) { }

    async findAllQuery(
        populateFields: any[],
        filterQuery: FilterQuery<any> = null,
        projection: Record<string, any> = null,
        sortQuery: Record<string, -1 | 1> = null,
        limit: number,
        skip: number,
        tenant_id?: string,
    ): Promise<PaginatedResult<T>> {
        if (tenant_id) filterQuery = { ...filterQuery, tenant_id };
        const countPromise = this.model.countDocuments(filterQuery).exec();
        const findPromise = this.model.find(
            filterQuery,
            projection,
            { limit, skip }
        )
            .sort(sortQuery)
            .populate(populateFields)
            .exec();
        return Promise.all([countPromise, findPromise]).then(([count, documents]) => ({
            limit,
            skip,
            count,
            documents
        }));
    }

    async findOne(id: string, populate: any[] = null, tenant_id?: string): Promise<T> {
        let filterQuery: FilterQuery<any> = { _id: id };
        if (tenant_id) filterQuery = { ...filterQuery, tenant_id };
        const entity = await this.model.findOne(filterQuery).populate(populate).exec();
        if (!entity) {
            throw new HttpException(`Entity with id ${id.toString()} not found`, HttpStatus.NOT_FOUND);
        }
        return entity;
    }

    async create(createDto: any, tenant_id?: string): Promise<T> {
        if (tenant_id) createDto = { ...createDto, tenant_id };
        const entity = new this.model(createDto);
        return entity.save() as T;
    }

    async createMany(createDtos: any[], tenant_id?: string, max_concurrent: number = 100): Promise<T[]> {
        const results: T[] = [];
        if (tenant_id) {
            createDtos = createDtos.map((dto) => ({ ...dto, tenant_id }));
        }
        for (let i = 0; i < createDtos.length; i += max_concurrent) {
            const chunk = createDtos.slice(i, i + max_concurrent);
            const chunkResults = await Promise.all(
                chunk.map(async (dto) => {
                    try {
                        const result = await this.create(dto, tenant_id);
                        return result; // Nếu thành công, trả về kết quả
                    } catch (error) {
                        console.error(`Error creating document:`, error);
                        return { error, data: dto }; // Nếu thất bại, trả về lỗi kèm dữ liệu
                    }
                })
            );
            results.push(...chunkResults as T[]);
        }
        return results;
    }

    async update(id: string, updateDto: any, tenant_id?: string): Promise<T> {
        let filterQuery: FilterQuery<any> = { _id: id };
        if (tenant_id) {
            filterQuery = { ...filterQuery, tenant_id };
            updateDto = { ...updateDto, tenant_id };
        };
        const entity = await this.model.findOneAndUpdate(
            filterQuery,
            updateDto,
            { new: true }
        ).exec();
        if (!entity) {
            throw new HttpException(`Entity with id ${id} not found`, HttpStatus.NOT_FOUND);
        }
        return entity;
    }

    async updateMany(updateDto: any[], tenant_id?: string, max_concurrent = 100): Promise<T[]> {
        const results: T[] = [];
        if (tenant_id) {
            updateDto = updateDto.map((dto) => ({ ...dto, tenant_id }));
        }
        for (let i = 0; i < updateDto.length; i += max_concurrent) {
            const chunk = updateDto.slice(i, i + max_concurrent);
            const chunkResults = await Promise.all(
                chunk.map(async (dto) => {
                    try {
                        if (!dto.id && !dto._id) throw new Error("ID is required");
                        const result = await this.update(dto.id || dto._id, dto, tenant_id);
                        return result; // Nếu thành công, trả về kết quả
                    } catch (error) {
                        console.error(`Error updating document:`, error);
                        return { error, data: dto }; // Nếu thất bại, trả về lỗi kèm dữ liệu
                    }
                })
            );

            results.push(...chunkResults as T[]);
        }
        return results;
    }

    async hardDelete(id: string, user?: any, tenant_id?: string): Promise<T> {
        let fieldQuery: FilterQuery<any> = { _id: id };
        if (tenant_id) fieldQuery = { ...fieldQuery, tenant_id };
        const entity = await this.model.findOneAndDelete(fieldQuery).exec();
        if (!entity) {
            throw new HttpException(`Entity with id ${id} not found`, HttpStatus.NOT_FOUND);
        }
        return entity;
    }

}