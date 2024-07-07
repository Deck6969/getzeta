import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TRANSACTIONENUM, TRANSACTIONSTATUSENUM } from 'src/enum/transaction.enum';
import { generateStringId } from 'src/utils/utils';

export type TransactionDocument = HydratedDocument<Transaction>;


@Schema()
export class Transaction {
    @Prop({ type: String, default: generateStringId })
    _id: string;

    @Prop({ type: String, default: '' })
    userId: string;

    @Prop({ type: String, default: '' })
    walletId: string;

    @Prop({ type: String, default: '' })
    fromAddress: string;

    @Prop({ type: String, default: '' })
    toAddress: string;

    @Prop({ type: String, default: '' })
    coinId: string;

    @Prop({ type: String, default: TRANSACTIONENUM.DEPOSIT, enum: TRANSACTIONENUM })
    type: string;

    @Prop({ type: Number, default: 0 })
    amount: number;

    @Prop({ type: Number, default: 0 })
    fee: number;

    @Prop({ type: Number, default: 0 })
    swapFee: number;

    @Prop({ type: Number, default: 0 })
    balance: number;

    @Prop({ type: Number, default: 0 })
    swappedAmount: number;

    @Prop({ type: Number, default: 0 })
    swappedPrice: number;

    @Prop({ type: String, default: '', })
    trxHash: string;

    @Prop({ type: String, default: '', })
    trxUrl: string;

    @Prop({ type: String, default: '', })
    bankName: string;

    @Prop({ type: String, default: '', })
    accountNumber: string;

    @Prop({ type: String, default: '', })
    accountName: string;

    @Prop({ type: String, enum: TRANSACTIONSTATUSENUM, default: TRANSACTIONSTATUSENUM.COMPLETED, })
    status: string;

    @Prop({ type: String, default: '' })
    currencyId: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    },
});

TransactionSchema.set('toObject', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
    },
});

TransactionSchema.set('timestamps', true);
