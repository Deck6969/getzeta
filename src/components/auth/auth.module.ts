import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/User/user.schema';
import { Otp, OtpSchema } from 'src/schema/OTP/otp.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UtilsService } from '../utils/utils.service';
import { WalletModule } from '../wallet/wallet.module';
import { Currency, CurrencySchema } from 'src/schema/Currency/currency.schema';


@Module({})
export class AuthModule {
    static forRoot(): any {
        return {
            imports: [
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                    { name: Otp.name, schema: OtpSchema },
                    { name: Currency.name, schema: CurrencySchema },
                ]),
                JwtModule.register({
                    secret: process.env.JWT_SECRET,
                    signOptions: { expiresIn: '99999999999s' },
                }),
                WalletModule,
            ],
            controllers: [AuthController],
            providers: [AuthService, JwtStrategy, UtilsService],
            module: AuthModule,
        };
    }
}
