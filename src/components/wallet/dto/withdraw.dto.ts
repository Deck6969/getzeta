import { ApiProperty } from '@nestjs/swagger';
import { CoinNetworkDTO } from './coinNetwork.dto';

export class WithdrawDTO extends CoinNetworkDTO {
    @ApiProperty()
    address: string;
    @ApiProperty()
    amount: number;
}

export class SwapDTO extends CoinNetworkDTO {
    @ApiProperty()
    amount: number;
}

export class WithdrawFiatDTO {
    @ApiProperty()
    amount: number;
    @ApiProperty({ required: true })
    bankName?: string;
    @ApiProperty({ required: true })
    accountNumber?: string;
    @ApiProperty({ required: true })
    accountName?: string;
}

