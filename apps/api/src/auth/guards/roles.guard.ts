import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { UserRole } from "@prisma/client";

import { ROLES_KEY } from "../decorators/roles.decorator";
import type { AuthenticatedUser } from "../auth.types";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowed || allowed.length === 0) return true;
    const req = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    if (!req.user) throw new ForbiddenException();
    if (!allowed.includes(req.user.role)) {
      throw new ForbiddenException(`Role ${req.user.role} is not allowed`);
    }
    return true;
  }
}
