import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { handleSearch, ResultHandleSearch } from '../tools/search.tool';

export const SearchParams = createParamDecorator(
    (
        data: unknown,
        ctx: ExecutionContext,
    ): ResultHandleSearch => {
        const request = ctx.switchToHttp().getRequest();
        const queryParams = request.query;
        return handleSearch(queryParams);
    },
);
