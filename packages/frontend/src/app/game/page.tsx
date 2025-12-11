'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function GamePage() {
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const charData = localStorage.getItem('selectedCharacter');
    if (!charData) {
      router.push('/character-select');
      return;
    }

    setCharacter(JSON.parse(charData));

    // Connect to game server
    connectToGameServer();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectToGameServer = () => {
    const token = localStorage.getItem('token');
    const charData = localStorage.getItem('selectedCharacter');
    
    if (!token || !charData) return;

    const char = JSON.parse(charData);
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
      console.log('Connected to game server');
      setConnected(true);

      // Send connect message
      ws.send(JSON.stringify({
        type: 'CONNECT',
        payload: {
          token,
          characterId: char.id,
        },
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received:', message);

      // Handle different message types
      switch (message.type) {
        case 'WELCOME':
          console.log('Welcome to the game!', message.payload);
          break;
        case 'ENTITY_UPDATE':
          // Update entity positions
          break;
        case 'COMBAT_EVENT':
          console.log('Combat event:', message.payload);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('Disconnected from game server');
      setConnected(false);
    };

    wsRef.current = ws;
  };

  const handleMove = (x: number, y: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'PLAYER_MOVE',
        payload: {
          x,
          y,
          z: 0,
          moveType: 'RUN',
          timestamp: Date.now(),
        },
      }));
    }
  };

  if (!character) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HUD */}
      <div className="fixed top-0 left-0 right-0 bg-gray-800/90 p-4 shadow-lg z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{character.name}</h2>
            <p className="text-sm text-gray-400">
              Level {character.level} {character.race} {character.class}
            </p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className={`px-3 py-1 rounded text-sm ${connected ? 'bg-green-600' : 'bg-red-600'}`}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
            
            <button
              onClick={() => router.push('/character-select')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
              Exit to Character Select
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="pt-24 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">🎮 Game World</h3>
            <p className="text-gray-400 mb-6">
              You are now in the game! This is a placeholder for the 3D game view.
            </p>
            
            <div className="bg-gray-900 rounded-lg p-12 mb-6 border-2 border-gray-700">
              <p className="text-lg mb-4">Game Viewport</p>
              <p className="text-sm text-gray-500">
                In a full implementation, this would show:<br/>
                - 3D rendered game world<br/>
                - Other players and NPCs<br/>
                - Interactive environment<br/>
                - Combat effects
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={() => handleMove(10, 0)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
              >
                Move Right →
              </button>
              <button
                onClick={() => handleMove(-10, 0)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
              >
                ← Move Left
              </button>
              <button
                onClick={() => handleMove(0, 10)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded font-semibold"
              >
                Move Up ↑
              </button>
              <button
                onClick={() => handleMove(0, -10)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded font-semibold"
              >
                ↓ Move Down
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar (placeholder) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 p-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-2 justify-center">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="w-12 h-12 bg-gray-700 border-2 border-gray-600 rounded flex items-center justify-center font-bold text-gray-500"
            >
              {i}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
