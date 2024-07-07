import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { generateStringId } from "src/utils/utils";

export type CurrencyDocument = HydratedDocument<Currency>;

@Schema()
export class Currency {
    @Prop({ type: String, default: generateStringId })
    _id: string;

    @Prop({ type: String, default: '' })
    name: string;

    @Prop({ type: String, default: '' })
    symbol: string;

    @Prop({ type: String, default: '' })
    coinGeckoId: string;

    @Prop({ type: String, default: '' })
    logoUrl: string;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);

CurrencySchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    },
});

CurrencySchema.set('toObject', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    },
});

CurrencySchema.set('timestamps', true);

CurrencySchema.index({ isDeleted: 1, isActive: 1 });
CurrencySchema.index({ isDeleted: 1, isActive: 1, name: 1 });
CurrencySchema.index({ isDeleted: 1, isActive: 1, symbol: 1 });
CurrencySchema.index({ isDeleted: 1, isActive: 1, coinGeckoId: 1 });
CurrencySchema.index({ isDeleted: 1, isActive: 1, name: 1, symbol: 1 });
CurrencySchema.index({ isDeleted: 1, isActive: 1, name: 1, coinGeckoId: 1 });
CurrencySchema.index({ isDeleted: 1, isActive: 1, symbol: 1, coinGeckoId: 1 });
CurrencySchema.index({ isDeleted: 1, isActive: 1, name: 1, symbol: 1, coinGeckoId: 1 });
