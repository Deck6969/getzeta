import { ApiProperty } from '@nestjs/swagger';

export class URLBody {
  @ApiProperty()
  url: string;
}
