import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/guards/admin.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import ServerResponse from 'src/utils/ServerResponse';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private userService: UserService
  ) { }

  @Post('create')
  async create(@Body() dto: CreateUserDTO) {
    const response = await this.userService.create(dto);
    return ServerResponse.success('User created successfully', { ...response });
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiParam({ name: 'id', required: true })
  async findById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return ServerResponse.success('User fetched successfully', { user });
  }

  @Get('')
  @UseGuards(AdminGuard)
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'userType', required: false })
  @ApiQuery({ name: 'q', required: false })
  async all(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('q') q?: string,
    @Query('userType') userType?: 'END_USER' | 'ADMIN',
  ) {
    const users = await this.userService.findAll(page, limit, userType, q);
    return ServerResponse.success('Users fetched successfully', { ...users });
  }


}
