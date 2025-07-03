import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const ENTITY_KEY = 'entity';

export const Entity = (entityName: string) => {
  return (target: any, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    SetMetadata(ENTITY_KEY, entityName)(target, key, descriptor);
  };
};