import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsEnumArray(enumType: object, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isEnumArray',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (!Array.isArray(value)) {
                        return false;
                    }
                    return value.every(val => Object.values(enumType).includes(val));
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be an array of valid enum values`;
                }
            }
        });
    };
}