import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

import { IsNotEmpty } from "class-validator";

export class CreateLoanDTO {

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    @Min(1)
    amount: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    @Min(1)
    monthlyIncome: number;

}