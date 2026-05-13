import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import type { User, UserRole } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

const SALT_ROUNDS = 12;

export type SafeUser = Omit<User, "passwordHash">;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async findByIdSafe(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.safeSelect,
    });
  }

  async listAll(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      select: this.safeSelect,
    });
  }

  async create(input: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    isActive?: boolean;
  }): Promise<SafeUser> {
    const email = input.email.toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException("Пользователь с таким email уже существует");
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const u = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: input.fullName.trim(),
        role: input.role,
        isActive: input.isActive ?? true,
      },
      select: this.safeSelect,
    });
    this.logger.log(`User created id=${u.id} email=${u.email} role=${u.role}`);
    return u;
  }

  async update(
    id: string,
    actorId: string,
    patch: { fullName?: string; role?: UserRole; isActive?: boolean },
  ): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Пользователь не найден");

    // Prevent self-lock-out: an admin can't deactivate or downgrade themselves.
    if (existing.id === actorId) {
      if (patch.isActive === false) {
        throw new BadRequestException("Нельзя деактивировать самого себя");
      }
      if (patch.role && patch.role !== existing.role) {
        throw new BadRequestException("Нельзя сменить свою собственную роль");
      }
    }

    // Prevent dropping last active ADMIN to non-admin or inactive
    if (existing.role === "ADMIN") {
      const willDemote = patch.role && patch.role !== "ADMIN";
      const willDeactivate = patch.isActive === false;
      if (willDemote || willDeactivate) {
        const activeAdmins = await this.prisma.user.count({
          where: { role: "ADMIN", isActive: true, id: { not: existing.id } },
        });
        if (activeAdmins === 0) {
          throw new BadRequestException(
            "Это последний активный администратор — действие запрещено",
          );
        }
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: patch.fullName?.trim(),
        role: patch.role,
        isActive: patch.isActive,
      },
      select: this.safeSelect,
    });
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Пользователь не найден");
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id }, data: { passwordHash } }),
      this.prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    this.logger.log(`Password reset for user id=${id}`);
  }

  async changeOwnPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Пользователь не найден");
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Неверный текущий пароль");
    if (currentPassword === newPassword) {
      throw new BadRequestException("Новый пароль совпадает с текущим");
    }
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    this.logger.log(`Self password change user=${userId}`);
  }

  private get safeSelect() {
    return {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }
}
