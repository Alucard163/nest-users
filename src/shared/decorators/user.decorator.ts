import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from "../interfaces/user-payload.interface";

export const User = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
