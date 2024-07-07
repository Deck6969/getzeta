import { ApiProperty } from "@nestjs/swagger";

export class SendEmailDTO {
    @ApiProperty()
    from: string;

    @ApiProperty()
    to: string[];

    @ApiProperty()
    subject: string;

    @ApiProperty()
    text?: string;

    @ApiProperty()
    html?: string;
}