import { ApiProperty } from '@nestjs/swagger';
import { MinLength, Matches } from 'class-validator';

const NUMBER = /\d/
const CAPITAL_LETTER = /[A-Z]/;
const SMALL_LETTER = /[a-z]/;
const SPECIAL_CHARACTER = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
const MIN_LENGTH = 8;

export class SignupDTO {

    @ApiProperty()
    fullname: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    @MinLength(MIN_LENGTH, { message: 'Minimum 8 characters required' })
    @Matches(NUMBER, { message: 'Minimum 1 digit required' })
    @Matches(CAPITAL_LETTER, { message: 'Minimum 1 uppercase character required' })
    @Matches(SMALL_LETTER, { message: 'Minimum 1 lowercase character required' })
    @Matches(SPECIAL_CHARACTER, { message: 'Minimum 1 special character required' })
    password: string;


    isAdmin?: boolean;

    authSecret?: string;

    @ApiProperty()
    currencyId: string;
}
