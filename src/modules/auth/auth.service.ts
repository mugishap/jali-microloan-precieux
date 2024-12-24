import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    async login(dto: LoginDTO) {
        const user = await this.userService.findByTelephone(dto.telephone)
        if (!user) throw new HttpException("Invalid telephone or password", 401)
        const match = compareSync(dto.password, user.password)
        if (!match) throw new HttpException("Invalid telephone or password", 401)
        const token = this.jwtService.sign({ id: user.id })
        return { token, user }
    }

}
