import { ApiProperty } from '@nestjs/swagger';


export class UpdatePriceDTO {

    @ApiProperty({ required: true })
    coinId: string;

    @ApiProperty({ required: false })
    price: number;
}
