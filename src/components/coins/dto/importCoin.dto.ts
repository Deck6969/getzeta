import { ApiProperty } from '@nestjs/swagger';

export class ImportCoinDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  coinGeckoId: string;

  @ApiProperty()
  isToken: boolean;

  @ApiProperty()
  contractAddress: string;

  @ApiProperty()
  decimal: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  networkId: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  routerProtocolContractAddress: string;

  @ApiProperty()
  routerProtocolReserveHandlerAddress: string;
}
