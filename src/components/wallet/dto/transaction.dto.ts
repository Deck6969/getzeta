import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TRANSACTIONENUM, TRANSACTIONSTATUSENUM } from 'src/enum/transaction.enum';

export class TransactionDTO {

    userId?: string;

    @ApiProperty()
    limit: string;

    @ApiProperty()
    offset: string;

    @ApiProperty({ required: false, enum: TRANSACTIONENUM })
    type: string;

    @ApiProperty({ required: false, enum: TRANSACTIONSTATUSENUM })
    status: string;
}


export class UpdateTransactionDTO {

    @ApiProperty({ required: true })
    transactionId: string;

    @ApiProperty({ required: true, enum: TRANSACTIONSTATUSENUM })
    @IsEnum(TRANSACTIONSTATUSENUM)
    status: string;

    @ApiProperty({ required: false })
    trxUrl: string;
}