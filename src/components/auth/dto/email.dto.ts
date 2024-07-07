import { ApiProperty } from '@nestjs/swagger';

export class EmailDTO {
    @ApiProperty()
    email: string;
}
