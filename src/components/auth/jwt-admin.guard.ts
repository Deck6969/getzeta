import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAdminGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {

    const { user } = context.switchToHttp().getRequest();

    return user.isAdmin;
  }
}

@Injectable()
export class JwtSuperAdminGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    return user.isSuperAdmin;
  }
}
