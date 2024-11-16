import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';


@Injectable()
export class AuthService {

  async register(registerUserDto: RegisterUserDto){
    return registerUserDto
  }

  
  async login( loginUserDto: LoginUserDto){

  }

  
  async verify(token: string){

  }

}
