import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { generateStringId } from "src/utils/utils";

export type CoinPriceDocument = HydratedDocument<CoinPrice>;

@Schema()
export class CoinPrice {
    @Prop({ type: String, default: generateStringId })
    _id: string;

    @Prop({ type: String, default: '' })
    coinId: string;

    @Prop({ type: String, default: '' })
    networkId: string;

    @Prop({ type: String, default: '' })
    currencyId: string;

    @Prop({ type: String, default: '' })
    name: string;

    @Prop({ type: Number, default: 0 })
    priceMarket: number;

    @Prop({ type: Number, default: 0 })
    priceFormer: number;

    @Prop({ type: Number, default: 0 })
    price: number;

    @Prop({ type: Number, default: 0 })
    priceChange: number;
}

export const CoinPriceSchema = SchemaFactory.createForClass(CoinPrice);

CoinPriceSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    }
});

CoinPriceSchema.set('toObject', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    }
});

CoinPriceSchema.set('timestamps', true);

CoinPriceSchema.index({ coinId: 1, currencyId: 1 });
CoinPriceSchema.index({ coinId: 1, currencyId: 1, priceMarket: 1 });
CoinPriceSchema.index({ coinId: 1, currencyId: 1, priceFormer: 1 });
CoinPriceSchema.index({ coinId: 1, currencyId: 1, price: 1 });
CoinPriceSchema.index({ coinId: 1, currencyId: 1, priceChange: 1 });
CoinPriceSchema.index({ coinId: 1, currencyId: 1, createdAt: 1 });
CoinPriceSchema.index({ coinId: 1, currencyId: 1, updatedAt: 1 });
