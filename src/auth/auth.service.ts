import { HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

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
        token: "token"
      }

    } catch (error) {
      console.log(error)
      throw new RpcException({
        message: error.error.message,
        statusCode: HttpStatus.BAD_REQUEST,
      })
    }

  }

  
  async verify(token: string){

  }

}
