import { HttpException, HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export class BaseDTO {
    static plainToClass<T>(cls: new (...args: any[]) => T, plain: object): T {
        return plainToClass(cls, plain, { excludeExtraneousValues: true });
    }

    static arrayPlainToClass<T>(cls: new (...args: any[]) => T, plains: Array<T>): T[] {
        return plains.map((plain) => plainToClass(cls, plain, { excludeExtraneousValues: true }));
    }

    static async validate<T>(this: new (...args: any[]) => T, plain: object): Promise<T> {
        const instance = plainToClass(this, plain, { excludeExtraneousValues: true });
        const errors = await validate(instance as any) as any;
        if (errors.length > 0) {
            console.log('errors',errors[0].children);
            // Nếu có lỗi, bạn có thể ném lỗi hoặc xử lý nó
            throw new HttpException(errors.toString(), HttpStatus.BAD_REQUEST);
        }
        return instance;
    }

    private static formatErrors(errors: ValidationError[]): string[] {
        let result = errors
            .map((err) => {
                if (err.constraints) {
                    return Object.values(err.constraints); // Trả về mảng các lỗi từ constraints
                }
                return [];
            })
            .flat(); // Dùng .flat() để "phẳng" mảng các mảng lỗi thành một mảng duy nhất
        return result;
    }
}
