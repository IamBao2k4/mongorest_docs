import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import admin from 'src/_cores/config/firebase.credential';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthRequestDto } from './dto/request.dto';
import { ROLE_SYSTEM, User } from 'src/_cores/entities/user.entity';
import { Role } from 'src/_cores/entities/role.entity';
import { Tenant } from 'src/_cores/entities/tenant.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private readonly accountModel: Model<User>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<Tenant>,
  ) { }

  async login(email: string, password: string): Promise<any> {
    const account = await this.accountModel.findOne({ email: email }).populate([
      {
        path: 'featured_image',
        model: 'Media',
      },
    ]).exec();
    if (!account)
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    if (
      !bcrypt.compareSync(password, account.password) ||
      account.is_active === false
    )
      throw new HttpException(
        'Account info is not valid',
        HttpStatus.BAD_REQUEST,
      );
    let accessToken = await this.jwtService.signAsync({
      id: account.id,
      email: account.email,
      username: account.username,
      phone: account.phone,
      role_system: account.role_system,
    });
    return {
      accessToken: accessToken,
      user: {
        id: account.id,
        email: account.email,
        username: account.username,
        phone: account.phone,
        role_system: account.role_system,
        role: account.role,
        featured_image: account.featured_image,
        role_front: account.role_front,
      },
    };
  }

  async register(data: AuthRequestDto.RegisterDataDto): Promise<any> {
    const account = await this.accountModel.findOne({ email: data.email });
    if (account)
      throw new HttpException('User is exist', HttpStatus.BAD_REQUEST);
    const result = await this.accountModel.create(data) as any;
    result.password = undefined;
    return result;
  }

  async loginWithFirebaseToken(token: string): Promise<any> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken.email_verified) {
        const account = await this.accountModel.findOne({ email: decodedToken.email_verified }).populate([
          {
            path: 'featured_image',
            model: 'Media',
          },
        ]).exec();
        if (!account)
          throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
        if (account.is_active === false)
          throw new HttpException('Account info is not valid', HttpStatus.BAD_REQUEST);
        let accessToken = await this.jwtService.signAsync({
          id: account.id,
          email: account.email,
          username: account.username,
          phone: account.phone,
          role_system: account.role_system,
        });
        return {
          accessToken: accessToken,
          user: {
            id: account.id,
            email: account.email,
            username: account.username,
            phone: account.phone,
            role_system: account.role_system,
            role: account.role,
            featured_image: account.featured_image,
            role_front: account.role_front,
          },
        };
      } else {
        throw new HttpException('Email not verified', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

}
