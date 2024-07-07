import { Module } from '@nestjs/common';
import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Coin, CoinSchema } from 'src/schema/Coin/coin.schema';
import { Network, NetworkSchema } from 'src/schema/Network/network.schema';
import { Currency, CurrencySchema } from 'src/schema/Currency/currency.schema';
import { CoinPrice, CoinPriceSchema } from 'src/schema/CoinPrice/coin-price.schema';
import { FeeInfo, FeeInfoSchema } from 'src/schema/FeeInfo/fee-info.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coin.name, schema: CoinSchema },
      { name: Network.name, schema: NetworkSchema },
      { name: Currency.name, schema: CurrencySchema },
      { name: CoinPrice.name, schema: CoinPriceSchema },
      { name: FeeInfo.name, schema: FeeInfoSchema },
    ]),
  ],
  controllers: [CoinsController],
  providers: [CoinsService],
})
export class CoinsModule { }
