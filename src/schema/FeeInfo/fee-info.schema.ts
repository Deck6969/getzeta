import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { generateStringId } from "src/utils/utils";

export type FeeInfoDocument = HydratedDocument<FeeInfo>;

@Schema()
export class FeeInfo {
    @Prop({ type: String, default: generateStringId })
    _id: string;

    @Prop({ type: String, default: '' })
    feeName: string;

    @Prop({ type: Number, default: 0 })
    feePercentage: number;
}

export const FeeInfoSchema = SchemaFactory.createForClass(FeeInfo);

FeeInfoSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    },
});

FeeInfoSchema.set('toObject', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    },
});

FeeInfoSchema.set('timestamps', true);

FeeInfoSchema.index({ feeName: 1, feePercentage: 1 });
