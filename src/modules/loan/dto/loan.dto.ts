import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

import { IsNotEmpty } from "class-validator";

export class CreateLoanDTO {

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    amount: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    monthlyIncome: number;

}