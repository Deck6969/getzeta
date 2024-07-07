import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { UserRoleENUM } from "src/enum/user.enum";

export class GetUsersDTO {

    @ApiProperty()
    limit: string;

    @ApiProperty()
    offset: string;

    @ApiProperty({ required: false, type: Boolean })
    filterOnlyAdmins: any;

}

export class UpdateUserActiveDTO {

    @ApiProperty({ required: true, type: String })
    userId: string;

    @ApiProperty({ required: true, type: Boolean })
    isActive?: boolean;

}

export class UpdateUserRoleDTO {

    @ApiProperty({ required: true, type: String })
    userId: string;

    @ApiProperty({ required: true, enum: UserRoleENUM })
    @IsEnum(UserRoleENUM)
    role?: string;

}
