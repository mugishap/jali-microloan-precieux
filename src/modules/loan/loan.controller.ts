import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthRequest } from 'src/types';
import { CreateLoanDTO } from './dto/loan.dto';
import { LoanService } from './loan.service';
import ServerResponse from 'src/utils/ServerResponse';
import { UserGuard } from 'src/guards/user.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { ApiParam, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoanStatus } from '@prisma/client';

@Controller('loan')
@ApiTags('loans')
@ApiBearerAuth()
export class LoanController {


    constructor(
        private readonly loanService: LoanService
    ) { }

    @Post("create")
    @UseGuards(UserGuard)
    async createLoan(
        @Body() dto: CreateLoanDTO,
        @Req() req: AuthRequest
    ) {
        const loan = await this.loanService.createLoan(req.user.id, dto);
        return ServerResponse.success("Loan created successfully", { ...loan });
    }

    @Patch("submit/:id")
    @UseGuards(UserGuard)
    @ApiParam({ name: 'id', required: true })
    async submitLoan(
        @Param("id") id: string,
        @Req() req: AuthRequest
    ) {
        const loan = await this.loanService.submitLoan(req.user.id, id);
        return ServerResponse.success("Loan submitted successfully", { ...loan });
    }

    @Patch("approve/:id")
    @UseGuards(AdminGuard)
    @ApiParam({ name: 'id', required: true })
    async approveLoan(
        @Param("id") id: string,
    ) {
        const loan = await this.loanService.approveLoan(id);
        return ServerResponse.success("Loan approved successfully", { ...loan });
    }

    @Patch("decline/:id")
    @UseGuards(AdminGuard)
    @ApiParam({ name: 'id', required: true })
    async declineLoan(
        @Param("id") id: string,
    ) {
        const loan = await this.loanService.declineLoan(id);
        return ServerResponse.success("Loan declined successfully", { ...loan });
    }

    @Get("")
    @UseGuards(AdminGuard)
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'userId', required: false })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('status') status?: LoanStatus,
        @Query('userId') userId?: string,
    ) {
        const loans = await this.loanService.findAll(
            page,
            limit,
            status,
            userId,

        );
        return ServerResponse.success("Loans fetched successfully", { loans });
    }


    @Get(":id")
    @ApiParam({ name: 'id', required: true })
    async findById(
        @Param("id") id: string,
    ) {
        const loan = await this.loanService.findById(id);
        return ServerResponse.success("Loan fetched successfully", { loan });
    }

    @Delete(":id")
    @ApiParam({ name: 'id', required: true })
    async delete(
        @Param("id") id: string,
    ) {
        const loan = await this.loanService.deleteLoan(id);
        return ServerResponse.success("Loan deleted successfully", { loan });
    }

}
