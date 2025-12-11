import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { AuthModule } from '../auth/auth.module';

/**
 * GatewayModule - WebSocket gateway for relaying messages
 * 
 * Note: This is a simple relay gateway for the MVP.
 * In production, clients would connect directly to the Game Server.
 * This gateway can be used for:
 * - Chat messages
 * - Social features
 * - Cross-server notifications
 */
@Module({
  imports: [AuthModule],
  providers: [GameGateway],
})
export class GatewayModule {}
