import {ConflictException, Inject, Injectable} from "@nestjs/common";
import { HASHER, TOKEN_SERVICE, USER_REPO } from "../constants/constants";
import type { HasherPort, TokenServicePort, UserRepositoryPort } from "../ports";
import {UserEntity} from "../../domain/entities/user.entity";

@Injectable()
export class RegisterUserUseCase {
    constructor(
        @Inject(USER_REPO)
        private readonly users: UserRepositoryPort,
        @Inject(TOKEN_SERVICE)
        private readonly tokens: TokenServicePort,
        @Inject(HASHER)
        private readonly hasher: HasherPort,
    ) {}

    async execute(input: { login: string; email: string; password: string; age: number; about: string }) {
        const exists = await this.users.findByLogin(input.login);
        if (exists) throw new ConflictException('Такой логин уже существует');

        const now = new Date();
        const entity = new UserEntity(
            crypto.randomUUID(),
            input.login,
            input.email,
            await this.hasher.hash(input.password),
            input.age,
            input.about,
            null,
            null,
            now,
            now
        );
        await this.users.create(entity);

        const pair = await this.tokens.issuePair(entity.id, entity.login);
        entity.currentHashedRt = await this.hasher.hash(pair.refresh);
        await this.users.save(entity);

        return { user: entity, tokens: pair };
    }
}
