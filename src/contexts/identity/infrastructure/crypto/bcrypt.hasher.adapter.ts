import { HasherPort } from "../../application/ports";
import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class BcryptHasherAdapter implements HasherPort {
    hash(v: string) { return bcrypt.hash(v, 12); }
    compare(v: string, h: string) { return bcrypt.compare(v, h); }
}