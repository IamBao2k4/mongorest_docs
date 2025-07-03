import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { appSettings } from 'src/_cores/config/appsettings';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from 'src/_cores/entities/user.entity';
import { Role, RoleSchema } from 'src/_cores/entities/role.entity';
import { Tenant, TenantSchema } from 'src/_cores/entities/tenant.entity';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: appSettings.jwtSecret,
      signOptions: { expiresIn: appSettings.expireIn, algorithm: 'HS256' },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AUTH_SERVICE_TIENNT',
      useClass: AuthService,
    },
  ],
  exports: [
    {
      provide: 'AUTH_SERVICE_TIENNT',
      useClass: AuthService,
    },
  ],
})
export class AuthModule { }
