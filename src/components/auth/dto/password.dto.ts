import { ApiProperty } from '@nestjs/swagger';

export class PasswordDTO {
  @ApiProperty()
  password: string;
}

export class ChangePasswordDTO {
  @ApiProperty()
  oldPassword: string;
  @ApiProperty()
  password: string;
}

export class ChangeEmailDTO {
  @ApiProperty()
  oldEmail: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
}