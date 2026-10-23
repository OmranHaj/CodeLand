import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Student side of the Sunday Arena.
 * - Students (CHILD) can read problems, reveal hints and submit.
 * - Admins may only read (GET) so they can see the student view; they can
 *   never trigger hint penalties or earn XP through these routes.
 */
@Injectable()
export class ArenaStudentGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const role = (user.role || '').toUpperCase();
    if (role === 'CHILD') {
      return true;
    }

    const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';
    if (isAdmin && request.method === 'GET') {
      return true;
    }

    throw new ForbiddenException('Only students can take part in the Sunday Arena.');
  }
}
