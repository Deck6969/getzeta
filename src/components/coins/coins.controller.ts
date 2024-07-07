import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CoinsService } from './coins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtAdminGuard } from '../auth/jwt-admin.guard';
import { UpdatePriceDTO } from './dto/coin.dto';

@ApiTags('Coins')
@Controller('coins')
export class CoinsController {
  constructor(private _coinsService: CoinsService) { }

  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'name', required: false, type: String })
  @Get('getCurrencies')
  async getCurrencies(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('name') name: string = null,
  ) {
    return await this._coinsService.getCurrencies(
      limit,
      offset,
      name,
    );
  }

  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'coinId', required: false, type: String })
  @ApiQuery({ name: 'networkId', required: false, type: String })
  @ApiQuery({ name: 'amount', required: false, type: Number, example: 1 })
  @Get('getCoins')
  async getCoins(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('coinId') coinId: string = null,
    @Query('networkId') networkId: string = null,
    @Query('amount') amount = 1,
  ) {
    return await this._coinsService.getCoins(
      limit,
      offset,
      coinId,
      networkId,
      amount
    );
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAdminGuard)
  // @UseGuards(JwtAuthGuard)
  // @Post('updatePrice')
  // updatePrice(@Body() updatePriceDTO: UpdatePriceDTO) {
  //   return this._coinsService.updatePrice(updatePriceDTO);
  // }

  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'coinNameSearch', required: false, type: String })
  @ApiQuery({ name: 'networkId', required: false, type: String })
  @ApiQuery({ name: 'currencyId', required: false, type: String })
  @Get('getCoinsPrice')
  async getCoinsPrice(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('coinNameSearch') coinNameSearch: string = null,
    @Query('networkId') networkId: string = null,
    @Query('currencyId') currencyId: string = null,
  ) {
    return await this._coinsService.getCoinsPrice(
      limit,
      offset,
      coinNameSearch,
      networkId,
      currencyId,
    );
  }

  @Get('getNetworks')
  async getNetworks(
  ) {
    return await this._coinsService.getNetworks(
    );
  }

}
