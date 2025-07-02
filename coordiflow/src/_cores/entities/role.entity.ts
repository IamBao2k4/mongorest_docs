import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Type as TransformType } from 'class-transformer';
import { Types } from 'mongoose';
import { IsOptional, ValidateNested } from 'class-validator';
import { ToLowerCaseArray } from '../utils/decorators/tranform.lowercase.decorator';
import { appSettings } from '../config/appsettings';

export enum FilterType {
  GET_ALL = 'get-all',
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}

export class Permission {

  @ToLowerCaseArray()
  @Expose()
  @Prop({ type: [FilterType], required: true })
  filter: FilterType[];

  @Expose()
  @Prop({ type: String })
  entity: string;

  @Expose()
  @Prop({ type: [String] })
  access_field: string[];

}

@Schema({ collection: 'role', timestamps: appSettings.timeZoneMongoDB })
export class Role {
  @Expose()
  @Prop({ required: true })
  title: string;

  @Expose()
  @Prop()
  description: string;

  @ValidateNested({ each: true })
  @TransformType(() => Permission)
  @Expose()
  @Prop({ type: [Permission], required: true })
  permission: Permission[];

  @IsOptional()
  @Expose()
  @Prop({ default: true })
  is_active: boolean; // for soft delete

  @Expose()
  @Prop({ type: Types.ObjectId, required: false, ref: 'Tenant' })
  tenant_id?: string;

  @Expose()
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  created_by?: string;

  @Expose()
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  updated_by?: string;

}

const RoleSchema = SchemaFactory.createForClass(Role);

export { RoleSchema };


// {
//   "_id": {
//     "$oid": "67a9ce00746a99dd3f054d93"
//   },
//   "title": "admin hoctienganhtot",
//   "permission": [
//     {
//       "filter": [
//         "get-all",
//         "get",
//         "post",
//         "put",
//         "delete",
//         "get-all-self",
//         "get-self",
//         "post-self",
//         "put-self",
//         "delete-self"
//       ],
//       "entity": "media",
//       "access_field": null
//     },
//     {
//       "filter": [
//         "get-all",
//         "get",
//         "post",
//         "put",
//         "delete",
//         "get-all-self",
//         "get-self",
//         "post-self",
//         "put-self",
//         "delete-self"
//       ],
//       "entity": "post",
//       "access_field": null
//     },
//     {
//       "filter": [],
//       "entity": "menu",
//       "access_field": null
//     },
//     {
//       "filter": [
//         "get-all",
//         "get",
//         "post",
//         "put",
//         "delete",
//         "get-all-self",
//         "get-self",
//         "post-self",
//         "put-self",
//         "delete-self"
//       ],
//       "entity": "category",
//       "access_field": null
//     },
//     {
//       "filter": [
//         "get-all"
//       ],
//       "entity": "entity",
//       "access_field": null
//     }
//   ],
//   "is_active": true,
//   "tenant_id": "67402f6755eed6d6efb150aa",
//   "created_by": "6711e8a47b45b2974bd6133c",
//   "updated_by": "6711e8a47b45b2974bd6133c",
//   "created_at": {
//     "$date": "2025-02-10T09:59:28.044Z"
//   },
//   "updated_at": {
//     "$date": "2025-02-10T10:08:27.616Z"
//   },
//   "__v": 0
// }