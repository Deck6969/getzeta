import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from 'src/schema/Wallet/wallet.schema';
import { User, UserSchema } from 'src/schema/User/user.schema';
import { Network, NetworkSchema } from 'src/schema/Network/network.schema';
import { Coin, CoinSchema } from 'src/schema/Coin/coin.schema';
import { Balance, BalanceSchema } from 'src/schema/Balance/balance.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/schema/Transaction/transaction.schema';
import { UtilsService } from '../utils/utils.service';
import { CoinPrice, CoinPriceSchema } from 'src/schema/CoinPrice/coin-price.schema';
import { FeeInfo, FeeInfoSchema } from 'src/schema/FeeInfo/fee-info.schema';
import { Currency, CurrencySchema } from 'src/schema/Currency/currency.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: User.name, schema: UserSchema },
      { name: Network.name, schema: NetworkSchema },
      { name: Coin.name, schema: CoinSchema },
      { name: Balance.name, schema: BalanceSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: CoinPrice.name, schema: CoinPriceSchema },
      { name: FeeInfo.name, schema: FeeInfoSchema },
      { name: Currency.name, schema: CurrencySchema },
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService, UtilsService],
  exports: [WalletService],
})
export class WalletModule { }
