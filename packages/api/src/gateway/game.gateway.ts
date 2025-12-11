import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * GameGateway - WebSocket gateway for real-time features
 * 
 * This is a relay gateway for non-gameplay features:
 * - Chat system
 * - Social notifications
 * - Party invites
 * 
 * Actual gameplay (movement, combat) happens in the Go Game Server
 */
@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedPlayers = new Map<string, Socket>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Clean up player from connected players map
    for (const [playerId, socket] of this.connectedPlayers.entries()) {
      if (socket.id === client.id) {
        this.connectedPlayers.delete(playerId);
        break;
      }
    }
  }

  /**
   * Handle chat messages
   */
  @SubscribeMessage('chat')
  handleChat(client: Socket, payload: { message: string; channel: string }) {
    // Broadcast chat message to all clients
    this.server.emit('chat', {
      playerId: client.id,
      message: payload.message,
      channel: payload.channel,
      timestamp: Date.now(),
    });
  }

  /**
   * Register player connection
   */
  @SubscribeMessage('register')
  handleRegister(client: Socket, payload: { playerId: string }) {
    this.connectedPlayers.set(payload.playerId, client);
    console.log(`Player registered: ${payload.playerId}`);
  }
}
