import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDTO {
    @ApiProperty({ required: false })
    image?: string;
    @ApiProperty({ required: false })
    fullname?: string;
    @ApiProperty({ required: false })
    phone?: string;
    @ApiProperty({ required: false })
    bankName?: string;
    @ApiProperty({ required: false })
    accountNumber?: string;
    @ApiProperty({ required: false })
    accountName?: string;
    @ApiProperty({ required: false, default: false })
    isAuthEnabled?: boolean;
    @ApiProperty({ required: false, default: false })
    isBiometricEnabled?: boolean;
}
