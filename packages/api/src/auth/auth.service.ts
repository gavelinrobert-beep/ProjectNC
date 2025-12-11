import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

/**
 * AuthService - Handles user authentication and account management
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new account
   */
  async register(dto: RegisterDto) {
    // Check if email or username already exists
    const existingUser = await this.prisma.account.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { username: dto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create account
    const account = await this.prisma.account.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = this.generateToken(account.id);

    return {
      account,
      token,
    };
  }

  /**
   * Login with email and password
   */
  async login(dto: LoginDto) {
    // Find account by email
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, account.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(account.id);

    return {
      account: {
        id: account.id,
        email: account.email,
        username: account.username,
      },
      token,
    };
  }

  /**
   * Validate JWT token and return account
   */
  async validateToken(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid token');
    }

    return account;
  }

  /**
   * Generate JWT token
   */
  private generateToken(accountId: string): string {
    return this.jwtService.sign({ sub: accountId });
  }
}
