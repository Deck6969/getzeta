import { ApiProperty } from '@nestjs/swagger';

export class NetworkDTO {
    @ApiProperty()
    networkId: string;
}

export class CoinNetworkDTO {

    @ApiProperty()
    coinId: string;

    @ApiProperty()
    networkId: string;

}
