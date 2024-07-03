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
  @UseGuards(MainGuard) //ensure request coming in has the default bearer token
  @Post(`/signin`)
  public async SignIn() {
    return this.service.signJWT();
  }

  @Roles([ADMIN]) //only an admin employee can access this endpoint since assessment doesn't specify sign up mode for users. So company admin users can do account creation for both employees and non employees that'd like to create blog posts
  @UseGuards(RolesGuard)
  @Post(`/signup`)
  public async CreateUser(@Body() req: SignUpDto) {
    return this.service.CreateUser(req);
  }
}
