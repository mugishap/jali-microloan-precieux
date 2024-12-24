import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import appConfig from 'src/config/app.config';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: appConfig().jwt.secret,
            signOptions: { expiresIn: appConfig().jwt.expiresIn },
        }),
        UserModule
    ],
    providers: [AuthService],
    controllers: [AuthController]
})
export class AuthModule { }
