import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

/**
 * JWT Strategy for Passport
 * Validates JWT tokens and attaches user to request
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-key',
    });
  }

  /**
   * Validate JWT payload and return user
   * This is called automatically by Passport after token verification
   */
  async validate(payload: any) {
    const account = await this.authService.validateToken(payload.sub);
    
    if (!account) {
      throw new UnauthorizedException();
    }
    
    return account;
  }
}
