import {Injectable} from "@nestjs/common";
import { UserRepositoryPort } from "../../application/ports";
import { UserEntity } from "../../domain/entities/user.entity";
import { PrismaService } from "./prisma.service";
import { UserPrismaMapper } from "./user.prisma.mapper";

@Injectable()
export class UserPrismaRepository implements UserRepositoryPort {
    constructor(
        private readonly _prismaService: PrismaService,
    ) {}

    async create(user: UserEntity): Promise<void> {
        await this._prismaService.user.create({
            data: UserPrismaMapper.toPersistence(user),
        })
    }

    async findById(id: string): Promise<UserEntity | null> {
        const row = await this._prismaService.user.findFirst({ where: { id, deletedAt: null } });
        return row ? UserPrismaMapper.toDomain(row) : null;
    }

    async findByLogin(login: string): Promise<UserEntity | null> {
        const row = await this._prismaService.user.findFirst({ where: { login, deletedAt: null } });
        return row ? UserPrismaMapper.toDomain(row) : null;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const row = await this._prismaService.user.findFirst({ where: { email, deletedAt: null } });
        return row ? UserPrismaMapper.toDomain(row) : null;
    }

    async save(user: UserEntity): Promise<void> {
        await this._prismaService.user.update({
            where: { id: user.id }, data: UserPrismaMapper.toPersistence(user)
        });
    }

    async search({ q, page, limit }) {
        const where = { deletedAt: null, ...(q ? { login: { contains: q, mode: 'insensitive' as const } } : {}) };
        const [rows, total] = await this._prismaService.$transaction([
            this._prismaService.user.findMany({ where, skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' } }),
            this._prismaService.user.count({ where }),
        ]);
        return { items: rows.map(UserPrismaMapper.toDomain), total };
    }

    async softDelete(id: string) {
        await this._prismaService.user.update({ where: { id }, data: { deletedAt: new Date(), currentHashedRt: null }});
    }

}