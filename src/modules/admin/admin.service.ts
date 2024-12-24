import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from '../user/dto/create-user.dto';
import { hash } from 'bcrypt';

@Injectable()
export class AdminService {

    constructor(
        private prisma: PrismaService
    ) { }

    async getStats() {
        const users = await this.prisma.user.count();
        const loans = await this.prisma.loan.count();

        return { users, loans }
    }

    async createAdmin(dto: CreateUserDTO) {
        const hashedPassword = await hash(dto.password, 10)
        const admin = await this.prisma.user.create({
            data: {
                ...dto,
                userType: "ADMIN",
                password: hashedPassword
            }
        });
        return admin;
    }

}
