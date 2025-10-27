import { UserEntity } from "../../domain/entities/user.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserPrismaMapper {
    static toDomain(row: any): UserEntity {
        return new UserEntity(
            row.id, row.login, row.email, row.passwordHash, row.age, row.about,
            row.deletedAt, row.currentHashedRt, row.createdAt, row.updatedAt
        );
    }
    static toPersistence(user: UserEntity) {
        const { id, login, email, passwordHash, age, about, deletedAt, currentHashedRt } = user;
        return { id, login, email, passwordHash, age, about, deletedAt, currentHashedRt };
    }
}