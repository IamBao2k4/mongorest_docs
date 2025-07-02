import { Body, Controller, Headers, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { BaseDTO } from 'src/_cores/common/base/dto.base';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/request.dto';
import { MODULE_VERSION } from '../version.config';

@Controller({ version: MODULE_VERSION, path: 'auth' })
export class AuthController {
    constructor(@Inject('AUTH_SERVICE_TIENNT') readonly authService: AuthService) { }

    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() data: AuthRequestDto.RegisterDataDto) {
        return await this.authService.register(BaseDTO.plainToClass(AuthRequestDto.RegisterDataDto, data));
    }

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    login(@Body() data: AuthRequestDto.LoginLocalDataDto) {
        return this.authService.login(data.email, data.password);
    }


    @Post('login-firebase')
    @HttpCode(HttpStatus.OK)
    loginWithFirebaseToken(
        @Headers('firebase') token: string,
    ) {
        return this.authService.loginWithFirebaseToken(token);
    }

}
