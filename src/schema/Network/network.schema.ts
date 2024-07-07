import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { NETWORKTYPEENUM } from 'src/enum/network.enum';
import { generateStringId } from 'src/utils/utils';

export type NetworkDocument = HydratedDocument<Network>;

@Schema()
export class Network {
  @Prop({ type: String, default: generateStringId })
  _id: string;

  @Prop({ type: String, default: '' })
  name: string;

  @Prop({ type: String, default: '' })
  symbol: string;

  @Prop({ type: String, default: '' })
  logoUrl: string;

  @Prop({ type: String, default: '' })
  rpcUrl: string;

  @Prop({ type: Number, default: 0 })
  chainId: number;

  @Prop({ type: String, default: '' })
  nativeCoinAddress: string;

  @Prop({ type: String, default: '' }) // ETH, POLYGON, BSC
  networkName: string;

  @Prop({ type: String, default: NETWORKTYPEENUM.EVM, enum: NETWORKTYPEENUM }) // mainnet, testnet
  networkType: string;

  @Prop({ type: Boolean, default: false })
  isMainnet: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Boolean, default: false })
  isActive: boolean;

}

export const NetworkSchema = SchemaFactory.createForClass(Network);

NetworkSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

NetworkSchema.set('toObject', {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

NetworkSchema.set('timestamps', true);

NetworkSchema.index({ name: 1 });
NetworkSchema.index({ symbol: 1 });
NetworkSchema.index({ chainName: 1 });
NetworkSchema.index({ networkName: 1 });
NetworkSchema.index({ networkType: 1 });
NetworkSchema.index({ name: 1, symbol: 1 });
NetworkSchema.index({ chainName: 1, networkName: 1 });
NetworkSchema.index({ chainName: 1, networkName: 1, networkType: 1 });
NetworkSchema.index({
  name: 1,
  symbol: 1,
  chainName: 1,
  networkName: 1,
  networkType: 1,
});
NetworkSchema.index({
  name: 1,
  symbol: 1,
  chainName: 1,
  networkName: 1,
  networkType: 1,
  rpcUrl: 1,
});
NetworkSchema.index({
  name: 1,
  symbol: 1,
  chainName: 1,
  networkName: 1,
  networkType: 1,
  rpcUrl: 1,
  logoUrl: 1,
});
NetworkSchema.index({
  name: 1,
  symbol: 1,
  chainName: 1,
  networkName: 1,
  networkType: 1,
  rpcUrl: 1,
  logoUrl: 1,
  _id: 1,
});
NetworkSchema.index({
  name: 1,
  symbol: 1,
  chainName: 1,
  networkName: 1,
  networkType: 1,
  rpcUrl: 1,
  logoUrl: 1,
  _id: 1,
  createdAt: 1,
});
