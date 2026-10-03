import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const role = (user.role || '').toUpperCase();
    if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
      throw new ForbiddenException('Administrator access required.');
    }

    return true;
  }
}
