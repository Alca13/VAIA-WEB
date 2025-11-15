import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const token = authHeader.slice(7);
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: JWT_SECRET });
      request.user = {
        userId: payload.sub,
        role: payload.role,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
