import { HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface/jwt-payload';
import { envs } from 'src/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService
  ) { }

  async register(registerUserDto: RegisterUserDto){

    const userExists = await this.prisma.user.findFirst({
      where: { email: registerUserDto.email }
    })

    if( userExists ){
      throw new RpcException({
        message: "Ya se registro este correo",
        statusCode: HttpStatus.BAD_REQUEST
      })
    }

    const user = await this.prisma.user.create({
      data: {
        ...registerUserDto,
        password: bcrypt.hashSync(registerUserDto.password, 10)
      }
    })

    const { password, ...restUser } = user;

    return {
      user: restUser,
      message: "Usuario registrado con exito"
    }
  }

  
  async login( loginUserDto: LoginUserDto){

    const { email, password } = loginUserDto;

    try {
      
      const user = await this.prisma.user.findFirst({
        where: { email }
      })

      if( !user ){
        throw new RpcException({
          message: "Credenciales incorrectas",
          statusCode: HttpStatus.UNAUTHORIZED,
        })
      }

      const isPaswordValid = bcrypt.compareSync(password, user.password)

      if( !isPaswordValid ){
        throw new RpcException({
          message: "Contraseña es incorrecta", //DESARROLLO SE ESPECIFICA QUE ES LA CONTRASEÑA
          statusCode: HttpStatus.UNAUTHORIZED,
        })
      }

      
      const {password: _, ...restUser} = user;

      return {
        user: restUser,
        token: await this.signJWT({ email: restUser.email, id: restUser.id, name: restUser.name })
      }

    } catch (error) {
      console.log(error)
      throw new RpcException({
        message: error.error.message,
        statusCode: HttpStatus.BAD_REQUEST,
      })
    }

  }

  async signJWT( payload: JwtPayload ){
    return this.jwtService.sign(payload)
  }
  
  async verify(token: string){

    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret
      })

      return {
        user,
        token
      }


    } catch (error) {
      console.log(error)
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "Token invalido" 
      })
    }

  }

}
