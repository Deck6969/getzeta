import { ApiProperty } from "@nestjs/swagger";

export class SetFeeDTO {
    @ApiProperty()
    feeName: string;

    @ApiProperty()
    feePercentage: number;
}
