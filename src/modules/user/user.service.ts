import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { paginator } from 'src/pagination/paginator';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { Prisma, UserType } from '@prisma/client';

@Injectable()
export class UserService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async create(dto: CreateUserDTO) {
        try {
            const hashedPassword = await hash(dto.password, 10)
            const user = await this.prisma.user.create({
                data: {
                    ...dto,
                    userType: "END_USER",
                    password: hashedPassword
                }
            })
            const token = await this.jwtService.sign({ id: user.id })
            return { user, token }
        }
        catch (error) {
            if (error.code === 'P2002') {
                const key = error.meta.target[0]
                throw new HttpException(`${key.charAt(0).toUpperCase() + key.slice(1)} (${dto[key]}) already exists`, 400);
            }
            throw new HttpException("Error occured", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }



    async findByTelephone(telephone: string) {
        const user = await this.prisma.user.findUnique({ where: { telephone } })
        return user
    }

    async findById(id: string) {
        try {
            const user = await this.prisma.user.findUniqueOrThrow({ where: { id } })
            return user
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new HttpException("User not found", HttpStatus.NOT_FOUND)
            }
            throw error
        }
    }

    async findAll(page: number, limit: number, userType?: UserType, searchKey?: string) {
        const condition: Prisma.UserWhereInput = {}
        if (userType) {
            condition.userType = userType
        }
        if (searchKey) {
            condition.OR = [{ firstName: { contains: searchKey } }, { lastName: { contains: searchKey } }, { telephone: { contains: searchKey } }]
        }

        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where: condition,
                take: Number(limit),
                skip: (Number(page) - 1) * Number(limit),
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prisma.user.count({ where: condition })
        ])
        return { users, meta: paginator({ page: Number(page), limit: Number(limit), total }) };
    }


}
