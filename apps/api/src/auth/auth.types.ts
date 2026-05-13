import type { UserRole } from "@prisma/client";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  fullName: string;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
};
