import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import type { AuthenticatedUser } from "../auth.types";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | null => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    return req.user ?? null;
  },
);
