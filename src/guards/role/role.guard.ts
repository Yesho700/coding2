import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Request, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {


  constructor(
    private readonly reflector: Reflector,
    private readonly JwtService: JwtService
  ){}

  async canActivate(
    context: ExecutionContext,
  ){
      
    const request = context.switchToHttp().getRequest();

    const accessToken = request.headers.authorization?.split(' ')[1];

    if(!accessToken){
      throw new ForbiddenException()
    }

    const requiredRole = this.reflector.getAllAndOverride('role', [context.getClass(), context.getHandler()])
    try{
        const payload = await this.JwtService.verify(accessToken);
        return requiredRole === requiredRole
    }catch(err){
      throw new UnauthorizedException();
    }
  }
}
