import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { generateStringId } from 'src/utils/utils';
import { Network } from '../Network/network.schema';
import { HydratedDocument } from 'mongoose';

export type CoinDocument = HydratedDocument<Coin>;

@Schema()
export class Coin {
  @Prop({ type: String, default: generateStringId })
  _id: string;

  @Prop({ type: String, default: '' })
  name: string;

  @Prop({ type: String, default: '' })
  symbol: string;

  @Prop({ type: String, default: '' })
  icon: string;

  @Prop({ type: String, default: '' })
  coinNameId: string; // for coinGecko

  @Prop({ type: Boolean, default: false })
  isToken: boolean;

  @Prop({ type: String, default: '' })
  contractAddress: string;

  @Prop({ type: Number, default: 18 })
  decimal: number;

  // https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=ngn
  @Prop({ type: Number, default: 0 })
  priceMarket: number;

  @Prop({ type: Number, default: 0 })
  priceFormer: number;

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: Number, default: 0 })
  priceChange: number;

  @Prop({ type: Number, default: 0 })
  swapFee: number;

  @Prop({ type: String, default: '', ref: Network.name })
  networkId: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  sort: number;

  @Prop({ type: String, default: '' })
  unit: string;

}

export const CoinSchema = SchemaFactory.createForClass(Coin);

CoinSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    delete ret._id;
  },
});

CoinSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    delete ret._id;
  },
});

CoinSchema.set('timestamps', true);

CoinSchema.index({ networkId: 1, isDeleted: 1, isActive: 1 });
CoinSchema.index({ networkId: 1, isDeleted: 1, isActive: 1, name: 1 });
CoinSchema.index({ networkId: 1, isDeleted: 1, isActive: 1, symbol: 1 });
CoinSchema.index({
  networkId: 1,
  isDeleted: 1,
  isActive: 1,
  contractAddress: 1,
});
CoinSchema.index({
  networkId: 1,
  isDeleted: 1,
  isActive: 1,
  name: 1,
  symbol: 1,
});
CoinSchema.index({
  networkId: 1,
  isDeleted: 1,
  isActive: 1,
  name: 1,
  contractAddress: 1,
});
CoinSchema.index({
  networkId: 1,
  isDeleted: 1,
  isActive: 1,
  symbol: 1,
  contractAddress: 1,
});
CoinSchema.index({
  networkId: 1,
  isDeleted: 1,
  isActive: 1,
  name: 1,
  symbol: 1,
  contractAddress: 1,
});
CoinSchema.index({
  networkId: 1,
  isDeleted: 1,
  isActive: 1,
  name: 1,
  symbol: 1,
  contractAddress: 1,
  decimal: 1,
});
CoinSchema.index({
  networkId: 1,
  isDeleted: 1,
  isActive: 1,
  name: 1,
  symbol: 1,
  contractAddress: 1,
  decimal: 1,
  price: 1,
});
CoinSchema.index({
  networkId: 1,
  isDeleted: 1,
  isActive: 1,
  name: 1,
  symbol: 1,
  contractAddress: 1,
  decimal: 1,
  price: 1,
  isToken: 1,
});
CoinSchema.index({
  networkId: 1,
  isDeleted: 1,
  isActive: 1,
  name: 1,
  symbol: 1,
  contractAddress: 1,
  decimal: 1,
  price: 1,
  isToken: 1,
  icon: 1,
});
CoinSchema.index({
  networkId: 1,
  isDeleted: 1,
  isActive: 1,
  name: 1,
  symbol: 1,
  contractAddress: 1,
  decimal: 1,
  price: 1,
  isToken: 1,
  icon: 1,
  _id: 1,
});
