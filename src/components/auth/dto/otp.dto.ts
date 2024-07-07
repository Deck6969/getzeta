import { ApiProperty } from '@nestjs/swagger';

export class OtpDTO {
  @ApiProperty()
  email: string;
  @ApiProperty()
  otp: string;
}
