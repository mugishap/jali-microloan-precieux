import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLoanDTO } from './dto/loan.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoanStatus, Prisma } from '@prisma/client';
import { paginator } from 'src/pagination/paginator';

@Injectable()
export class LoanService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    async createLoan(userId: string, data: CreateLoanDTO) {
        if (data.amount > data.monthlyIncome / 3) {
            throw new HttpException("Loan amount must not exceed 1/3 of the monthly income", HttpStatus.BAD_REQUEST);
        }
        const loan = await this.prisma.loan.create({
            data: {
                amount: data.amount,
                monthlyIncome: data.monthlyIncome,
                user: {
                    connect: {
                        id: userId
                    }
                }
            }
        })
        return loan;
    }

    async submitLoan(userId: string, loanId: string) {
        const loan = await this.findById(loanId)
        if (loan.userId !== userId) {
            throw new HttpException("This loan is not registered to you", HttpStatus.BAD_REQUEST);
        }
        const updatedLoan = await this.prisma.loan.update({
            where: { id: loanId },
            data: { status: "SUBMITTED" }
        })
        return updatedLoan;
    }

    async approveLoan(loanId: string) {
        const loan = await this.findById(loanId)
        if (loan.status != "SUBMITTED") {
            throw new HttpException("Loan must be submitted first", HttpStatus.BAD_REQUEST)
        }
        const approvedLoan = await this.prisma.loan.update({
            where: { id: loanId },
            data: { status: "APPROVED" }
        })
        return approvedLoan;
    }

    async declineLoan(loanId: string) {

        const loan = await this.findById(loanId)
        if (loan.status != "SUBMITTED") {
            throw new HttpException("Loan must be submitted first", HttpStatus.BAD_REQUEST)
        }
        const declinedLoan = await this.prisma.loan.update({
            where: { id: loanId },
            data: { status: "DECLINED" }
        })
        return declinedLoan;
    }

    async findById(loanId: string) {
        try {
            const loan = await this.prisma.loan.findUniqueOrThrow({ where: { id: loanId } })
            return loan;
        } catch (error) {
            if (error.code === 'P2025') {
                throw new HttpException("Loan not found", HttpStatus.NOT_FOUND);
            }
            throw error;
        }
    }

    async findAll(page: number, limit: number, status?: LoanStatus, userId?: string) {
        const condition: Prisma.LoanWhereInput = {}
        if (status) {
            condition.status = status;
        }
        if (userId) {
            condition.userId = userId;
        }

        const [loans, total] = await this.prisma.$transaction([
            this.prisma.loan.findMany({
                where: condition,
                skip: (Number(page) - 1) * limit,
                take: Number(limit)
            }),
            this.prisma.loan.count({ where: condition })
        ])

        return { loans, meta: paginator({ page: Number(page), limit: Number(limit), total }) };
    }

    async deleteLoan(loanId: string) {
        try {
            const loan = await this.prisma.loan.delete({
                where: { id: loanId }
            })
            return loan;
        } catch (error) {
            if (error.code === 'P2025') {
                throw new HttpException("Loan not found", HttpStatus.NOT_FOUND);
            }
            throw error;
        }
    }

}
