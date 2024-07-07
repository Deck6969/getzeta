import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OTPTYPEENUM } from 'src/enum/otp.enum';
import { generateStringId } from 'src/utils/utils';

export type OtpDocument = HydratedDocument<Otp>;

@Schema()
export class Otp {
    @Prop({ type: String, default: generateStringId })
    _id: string;

    @Prop({
        type: String,
        default: OTPTYPEENUM.VERIFY,
        enum: OTPTYPEENUM,
    })
    otpType: string;

    @Prop({ type: String, default: 0 })
    otp: string;

    @Prop({ type: String, default: '' })
    userId: string;

    @Prop({ type: Date, default: () => new Date(Date.now() + 120000) })
    expiryTime: Date;

    @Prop({ type: Boolean, default: false })
    isUsed: boolean;

    @Prop({ type: Boolean, default: false })
    isChangeEmail: boolean;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.set('timestamps', true);

OtpSchema.set('toJSON', {
    transform: function (_, ret, __) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

OtpSchema.set('toObject', {
    transform: function (_, ret, __) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

OtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });
OtpSchema.index({ userId: 1, otp: 1 });
OtpSchema.index({ userId: 1, expiryTime: 1 });
OtpSchema.index({ userId: 1, createdAt: 1 });
OtpSchema.index({ userId: 1, otp: 1, expiryTime: 1 });
OtpSchema.index({ userId: 1, otp: 1, createdAt: 1 });
OtpSchema.index({ userId: 1, otp: 1, expiryTime: 1, createdAt: 1 });
OtpSchema.index({
    userId: 1,
    otp: 1,
    expiryTime: 1,
    createdAt: 1,
    updatedAt: 1,
});
OtpSchema.index({
    userId: 1,
    otp: 1,
    expiryTime: 1,
    createdAt: 1,
    updatedAt: 1,
    _id: 1,
});
