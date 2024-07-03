import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import MainGuard from 'src/guards/main.guards';
import { SignUpDto } from '@dtos/auth.dtos';
import { RolesGuard } from 'src/guards/roles.guards';
import { ADMIN } from 'src/constants/auth.constants';
import { Roles } from 'src/decorators/roles.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  //sign in endpoint
  @UseGuards(MainGuard)
  @Post(`/signin`)
  public async SignIn() {
    return this.service.signJWT();
  }

  @Roles([ADMIN])
  @UseGuards(RolesGuard)
  @Post(`/signup`)
  public async CreateUser(@Body() req: SignUpDto) {
    return this.service.CreateUser(req);
  }
}
