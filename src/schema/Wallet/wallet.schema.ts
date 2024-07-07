import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateStringId } from 'src/utils/utils';

export type WalletDocument = HydratedDocument<Wallet>;


@Schema()
export class Wallet {
  @Prop({ type: String, default: generateStringId })
  _id: string;

  @Prop({ type: String, default: '' })
  userId: string;

  @Prop({ type: String, default: '' })
  evmAddress: string;

  @Prop({ type: String, default: '' })
  evmKey: string;

  @Prop({ type: String, default: '' })
  tronAddress: string;

  @Prop({ type: String, default: '' })
  tronKey: string;

  @Prop({ type: String, default: '' })
  btcPublicKey: string;

  @Prop({ type: String, default: '' })
  btcAddress: string;

  @Prop({ type: String, default: '' })
  btcKey: string;

  @Prop({ type: Number, default: 0 })
  currentSwappedBalance: number;

  @Prop({ type: Number, default: 0 })
  totalWithdrawnAmount: number;

  @Prop({ type: Number, default: 0 })
  totalWithdrawnAmountLocked: number;

}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

WalletSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    delete ret._id;
  },
});

WalletSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    delete ret._id;
  },
});

WalletSchema.set('timestamps', true);

WalletSchema.index({ userId: 1, type: 1, network: 1 });
WalletSchema.index({ userId: 1, type: 1, network: 1, name: 1 });
WalletSchema.index({ userId: 1, type: 1, network: 1, 'wallets.address': 1 });
WalletSchema.index({ userId: 1, type: 1, network: 1, 'wallets.privateKey': 1 });
WalletSchema.index({ userId: 1, type: 1, network: 1, 'wallets.type': 1 });
