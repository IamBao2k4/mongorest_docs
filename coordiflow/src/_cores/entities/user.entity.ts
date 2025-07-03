import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Expose } from 'class-transformer';
import { ArrayMaxSize, IsEmail, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { Role } from './role.entity';
import { appSettings } from '../config/appsettings';

export enum ROLE_SYSTEM {
  ADMIN = 'admin', // super admin
  USER = 'user',
}

@Schema({ timestamps: appSettings.timeZoneMongoDB, versionKey: false, collection: 'user' })
export class User {

  @Expose()
  @IsEmail()
  @Prop({
    type: String,
    required: true,
    unique: true,
    maxlength: 100,
  })
  email: string;

  @Expose()
  @Prop({
    required: true,
    maxlength: 200,
  })
  username: string;

  @Expose()
  @Prop({ type: Types.ObjectId, ref: 'Media', required: false })
  featured_image: string;

  @Expose()
  @Prop({
    maxlength: 20,
  })
  phone: string;

  @Expose()
  @Prop({
    required: true,
    maxlength: 100,
  })
  password: string;

  @Expose()
  @Prop({
    type: Date,
  })
  birthday: Date;

  @Prop({
    type: String,
    enum: ROLE_SYSTEM,
    default: ROLE_SYSTEM.USER,
  })
  role_system: ROLE_SYSTEM;

  @Expose()
  @Prop({ type: [Types.ObjectId], ref: Role.name, required: false })
  role: string[];

  @Expose()
  @ArrayMaxSize(1)
  @Prop({ required: false })
  role_front: string[];

  @Expose()
  @ArrayMaxSize(1)
  @IsOptional()
  @Prop({ type: [Types.ObjectId], ref: User.name, required: false, default: [] })
  parent_id: string[];

  @IsOptional()
  @Expose()
  @Prop({ type: Boolean, default: true })
  is_active: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);

// Apply the BaseEntitySchema pre-save middleware
UserSchema.pre('save', async function (next) {
  const User = this as User & { isNew: boolean; isModified: (field: string) => boolean };
  if (User.isModified('password') || User.isNew) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(User.password, salt);
    User.password = hash;
  }
  next();
});

UserSchema.pre('findOneAndUpdate', async function (next) {
  const User = this as any;
  if (User._update.password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(User._update.password, salt);
    User._update.password = hash;
  }
  next();
});

// Merge BaseEntitySchema into UserSchema
// UserSchema.add(BaseEntitySchema);

export { UserSchema };
