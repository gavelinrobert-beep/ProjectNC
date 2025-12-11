import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard
 * Use @UseGuards(JwtAuthGuard) to protect routes
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
