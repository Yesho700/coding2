import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from 'src/modules/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly tokenService: TokenService){}
  
  async canActivate(
    context: ExecutionContext
  ){
    
    const request = context.switchToHttp().getRequest();

    const accessToken = request.headers.authorization?.split(' ')[1];

    if(!accessToken){
      throw new UnauthorizedException("Login Again 1");
    }

    try{
      const payload = await this.tokenService.verify(accessToken);

      if(payload.userId != null)
        request['userId'] = payload.userId;

      if(payload.userEmail != null)
        request['userEmail'] = payload.userEmail;

    }catch(err){
      throw new UnauthorizedException("Login Again 2");
    }

    return true;
  }
}
