import { Module } from "@nestjs/common";
import { AuthModule } from "./_auth/auth.module";

@Module({
    imports: [
        AuthModule,
    ],
})
export class CoreModule { }