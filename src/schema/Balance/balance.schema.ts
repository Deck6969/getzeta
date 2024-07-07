import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { User } from '../User/user.schema';
import { Coin } from '../Coin/coin.schema';
import { Network } from '../Network/network.schema';
import { HydratedDocument } from 'mongoose';
import { Wallet } from '../Wallet/wallet.schema';
import { generateStringId } from 'src/utils/utils';

export type BalanceDocument = HydratedDocument<Balance>;

@Schema()
export class Balance {
  @Prop({ type: String, default: generateStringId })
  _id: string;

  @Prop({ type: String, default: '' })
  address: string;

  @Prop({ type: String, default: '', ref: User.name })
  userId: string;

  @Prop({ type: String, default: '', ref: Wallet.name })
  walletId: string;

  @Prop({ type: String, default: '', ref: Coin.name })
  coinId: string;

  @Prop({ type: String, default: '', ref: Network.name })
  networkId: string;

  @Prop({ type: Number, default: 0 })
  balance: number;

}

export const BalanceSchema = SchemaFactory.createForClass(Balance);

BalanceSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

BalanceSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

BalanceSchema.set('timestamps', true);

BalanceSchema.index({ userId: 1 });
BalanceSchema.index({ walletId: 1 });
BalanceSchema.index({ coinId: 1 });
BalanceSchema.index({ networkId: 1 });
BalanceSchema.index({ balance: 1 });
BalanceSchema.index({ balanceInUsd: 1 });
BalanceSchema.index({ createdAt: 1 });
BalanceSchema.index({ updatedAt: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1 });
BalanceSchema.index({ userId: 1, coinId: 1 });
BalanceSchema.index({ userId: 1, networkId: 1 });
BalanceSchema.index({ userId: 1, balance: 1 });
BalanceSchema.index({ userId: 1, balanceInUsd: 1 });
BalanceSchema.index({ userId: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, coinId: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, networkId: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, balance: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, balanceInUsd: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, networkId: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, balance: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, balanceInUsd: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, networkId: 1, balance: 1 });
BalanceSchema.index({ userId: 1, networkId: 1, balanceInUsd: 1 });
BalanceSchema.index({ userId: 1, networkId: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, networkId: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, balance: 1, balanceInUsd: 1 });
BalanceSchema.index({ userId: 1, balance: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, balance: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, balanceInUsd: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, balanceInUsd: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, createdAt: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, coinId: 1, networkId: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, coinId: 1, balance: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, coinId: 1, balanceInUsd: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, coinId: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, coinId: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, networkId: 1, balance: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, networkId: 1, balanceInUsd: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, networkId: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, networkId: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, balance: 1, balanceInUsd: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, balance: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, balance: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, balanceInUsd: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, balanceInUsd: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, Wallet: 1, createdAt: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, networkId: 1, balance: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, networkId: 1, balanceInUsd: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, networkId: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, networkId: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, balance: 1, balanceInUsd: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, balance: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, balance: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, balanceInUsd: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, balanceInUsd: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, coinId: 1, createdAt: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, networkId: 1, balance: 1, balanceInUsd: 1 });
BalanceSchema.index({ userId: 1, networkId: 1, balance: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, networkId: 1, balance: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, networkId: 1, balanceInUsd: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, networkId: 1, balanceInUsd: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, networkId: 1, createdAt: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, balance: 1, balanceInUsd: 1, createdAt: 1 });
BalanceSchema.index({ userId: 1, balance: 1, balanceInUsd: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, balance: 1, createdAt: 1, updatedAt: 1 });
BalanceSchema.index({ userId: 1, balanceInUsd: 1, createdAt: 1, updatedAt: 1 });
