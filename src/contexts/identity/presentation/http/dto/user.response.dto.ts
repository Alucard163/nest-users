import { UserView } from "../../../application/dto/user.view";
import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    login: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    age: number;

    @ApiProperty()
    about: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    static from(v: UserView): UserResponseDto {
        return Object.assign(new UserResponseDto(), v);
    }
}