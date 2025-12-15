# Unity 3D Client Integration Guide

This guide explains how the Unity 3D client integrates with the existing Next.js frontend and overall system architecture.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Integration Options](#integration-options)
3. [Current State](#current-state)
4. [Implementation Path](#implementation-path)
5. [Frontend-Unity Communication](#frontend-unity-communication)
6. [Deployment Strategies](#deployment-strategies)

---

## Architecture Overview

### System Components

```
┌─────────────────┐     HTTP/REST      ┌──────────────────┐
│   Next.js       │ ◄─────────────────► │   NestJS API     │
│   Frontend      │                     │   (Port 4000)    │
└─────────────────┘                     └──────────────────┘
        │                                        │
        │                                        │
        │                                    PostgreSQL
        │                                        │
        │                                        ▼
        │                               ┌──────────────────┐
        │                               │    Database      │
        │                               └──────────────────┘
        │
        │ WebSocket (Game)
        │
        ▼
┌─────────────────┐     WebSocket      ┌──────────────────┐
│  Unity Client   │ ◄─────────────────► │  Go Game Server  │
│  (This Project) │                     │  (Port 8080)     │
└─────────────────┘                     └──────────────────┘
```

### Communication Flow

1. **User visits** Next.js web app
2. **Login** → Next.js → NestJS API → Returns JWT token
3. **Character Select** → Next.js → NestJS API → Returns character list
4. **Enter Game** → Unity Client connects to Go Game Server with JWT
5. **Gameplay** → Unity Client ↔ Go Game Server (WebSocket)
6. **Logout** → Disconnect from Game Server → Return to Next.js

---

## Integration Options

### Option 1: WebGL Build (Embedded in Browser) ⭐ Recommended for Web

**Unity client runs inside the browser via WebGL.**

#### Pros
- Seamless web experience
- No download required
- Works on all platforms with browsers
- Single deployment pipeline

#### Cons
- Larger initial load (WebGL bundle size)
- Limited graphics quality compared to native
- No multi-threading
- Higher CPU/memory usage in browser

#### Implementation
1. Build Unity project as WebGL
2. Embed WebGL build in Next.js `/game` page
3. Unity iframe or React component wraps the game
4. Pass JWT token via URL parameters or postMessage

**File Structure:**
```
packages/frontend/
├── public/
│   └── unity/                 # Unity WebGL build output
│       ├── Build/
│       │   ├── game.loader.js
│       │   ├── game.framework.js
│       │   ├── game.data.unityweb
│       │   └── game.wasm.unityweb
│       └── index.html
└── src/
    └── app/
        └── game/
            └── page.tsx       # React page embedding Unity WebGL
```

**Next.js Game Page Example:**
```tsx
// packages/frontend/src/app/game/page.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function GamePage() {
  const { token, character } = useAuth();
  const unityRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (unityRef.current && token) {
      // Pass auth data to Unity
      const unityWindow = unityRef.current.contentWindow;
      unityWindow?.postMessage({
        type: 'AUTH_DATA',
        token,
        characterId: character.id
      }, '*');
    }
  }, [token, character]);

  return (
    <div className="w-screen h-screen">
      <iframe
        ref={unityRef}
        src="/unity/index.html"
        className="w-full h-full border-0"
        allow="accelerometer; gyroscope; microphone"
      />
    </div>
  );
}
```

### Option 2: Standalone Desktop Client (Native Build)

**Unity client as separate executable (Windows, Mac, Linux).**

#### Pros
- Best graphics quality
- Full performance (native code)
- Multi-threading support
- Larger asset support

#### Cons
- Requires download and installation
- Separate deployment for each platform
- Users must keep client updated
- Desktop-only (no web/mobile)

#### Implementation
1. Build Unity project for target platforms
2. Distribute via website download or launcher
3. Client launches directly
4. Uses saved credentials or opens browser for login

**Distribution:**
- Direct download from website
- Game launcher (Electron app) that downloads/updates client
- Steam, Epic Games Store, etc. (future)

### Option 3: Hybrid Approach

**Web version for casual players, native client for serious players.**

#### Implementation
- Next.js site offers both options
- WebGL for "Play Now" (instant access)
- Download link for native client (better performance)
- Same backend servers for both
- Shared authentication system

---

## Current State

### What's Implemented

**Next.js Frontend:**
- ✅ Login page with authentication
- ✅ Character select with character list
- ✅ Game page with placeholder "Game Viewport"
- ✅ Chat, HUD, action bar UI (2D overlay)

**Unity Client:**
- ✅ Complete C# scripts for all systems
- ✅ Network layer (WebSocket)
- ✅ Entity management
- ✅ Combat visualization
- ✅ Camera controller
- ✅ Input system
- ⚠️ Scenes not created (requires Unity Editor)
- ⚠️ Prefabs not created (requires Unity Editor)

### What's Needed

1. **Create Unity Scenes** (requires Unity Editor)
   - LoginScene, CharacterSelectScene, WorldScene
   
2. **Create Unity Prefabs** (requires Unity Editor)
   - Player, NPC, Monster prefabs
   - UI prefabs (nameplates, floating text)

3. **Choose Integration Path**
   - Option 1 (WebGL) or Option 2 (Native) or Option 3 (Hybrid)

4. **Build and Deploy**
   - Unity WebGL build (if Option 1)
   - Unity standalone builds (if Option 2)
   - Setup deployment pipeline

---

## Implementation Path

### Phase 1: Unity Editor Setup (Manual - Requires Unity)

1. **Open Unity Project**
   ```bash
   cd packages/unity-client
   # Open in Unity Hub
   ```

2. **Create Scenes**
   - Follow `Assets/Scenes/README.md`
   - Create LoginScene, CharacterSelectScene, WorldScene
   - Configure each scene according to setup guide

3. **Create Prefabs**
   - Follow `Assets/Prefabs/README.md`
   - Create Player.prefab with PlayerController
   - Create NPC.prefab with RemoteCharacter
   - Create UI prefabs (Nameplate, etc.)

4. **Test in Editor**
   - Play each scene individually
   - Verify systems initialize correctly
   - Test network connection to game server

### Phase 2: Build Configuration

#### For WebGL (Option 1)

1. **Unity Build Settings**
   ```
   File → Build Settings
   - Platform: WebGL
   - Compression Format: Brotli (best compression)
   - Code Optimization: Runtime Speed
   - Enable Exceptions: Explicitly Thrown Only
   ```

2. **Player Settings**
   ```
   - Resolution: Default Canvas Width/Height or match site
   - WebGL Template: Default or Minimal
   - Memory Size: 512 MB (adjust as needed)
   ```

3. **Build**
   ```
   Build to: packages/frontend/public/unity/
   ```

4. **Next.js Integration**
   - Create game page with iframe or Unity loader
   - Pass authentication via postMessage
   - Handle Unity → React messages

#### For Native (Option 2)

1. **Unity Build Settings**
   ```
   File → Build Settings
   - Platform: Windows/Mac/Linux
   - Compression: LZ4 or LZ4HC
   - Code Optimization: IL2CPP (better performance)
   ```

2. **Player Settings**
   ```
   - Resolution: Windowed, resizable
   - Default Resolution: 1920x1080
   - Company Name, Product Name
   ```

3. **Build**
   ```
   Build to: builds/windows/
   Build to: builds/mac/
   Build to: builds/linux/
   ```

4. **Distribution**
   - Upload to download server
   - Create installer (NSIS for Windows, DMG for Mac)
   - Update version check system

### Phase 3: Frontend Integration (WebGL Path)

1. **Install Unity Loader**
   ```bash
   cd packages/frontend
   npm install react-unity-webgl
   ```

2. **Create Unity Component**
   ```tsx
   // packages/frontend/src/components/UnityGame.tsx
   'use client';
   
   import { Unity, useUnityContext } from 'react-unity-webgl';
   
   export function UnityGame({ token, characterId }: Props) {
     const { unityProvider, sendMessage, isLoaded } = useUnityContext({
       loaderUrl: '/unity/Build/game.loader.js',
       dataUrl: '/unity/Build/game.data.unityweb',
       frameworkUrl: '/unity/Build/game.framework.js',
       codeUrl: '/unity/Build/game.wasm.unityweb',
     });
     
     useEffect(() => {
       if (isLoaded) {
         sendMessage('NetworkManager', 'SetAuthToken', token);
         sendMessage('NetworkManager', 'SetCharacterId', characterId);
       }
     }, [isLoaded, token, characterId]);
     
     return <Unity unityProvider={unityProvider} />;
   }
   ```

3. **Update Game Page**
   ```tsx
   // packages/frontend/src/app/game/page.tsx
   import { UnityGame } from '@/components/UnityGame';
   
   export default function GamePage() {
     const { token, character } = useAuth();
     
     return (
       <div className="w-screen h-screen">
         <UnityGame token={token} characterId={character.id} />
       </div>
     );
   }
   ```

4. **Handle Unity Messages**
   ```tsx
   // React receives messages from Unity
   addEventListener('message', (event) => {
     if (event.data.type === 'UNITY_LOGOUT') {
       // Handle logout
       router.push('/login');
     }
   });
   ```

### Phase 4: Testing

1. **Local Testing**
   ```bash
   # Start all services
   npm run docker:db:start
   npm run dev:api
   npm run dev:gameserver
   npm run dev:frontend
   
   # Open browser
   http://localhost:3000
   ```

2. **Test Flow**
   - Login with credentials
   - Select/create character
   - Click "Enter World"
   - Verify Unity loads
   - Test movement (WASD)
   - Test camera (right-click drag)
   - Verify network communication

### Phase 5: Deployment

#### WebGL Deployment

1. **Build Unity WebGL**
2. **Copy build to Next.js public folder**
3. **Deploy Next.js with Unity build**
4. **CDN optimization** (optional)
   - Upload Unity files to CDN
   - Update loader URLs

#### Native Deployment

1. **Build for all platforms**
2. **Create installers/packages**
3. **Upload to download server**
4. **Add download page to website**
5. **Version checking system**

---

## Frontend-Unity Communication

### Authentication Flow

**Option 1: Via postMessage (WebGL)**

```typescript
// React → Unity
window.frames[0].postMessage({
  type: 'AUTH_DATA',
  token: 'jwt_token_here',
  characterId: 'char_id_here'
}, '*');

// Unity receives (C#)
[DllImport("__Internal")]
private static extern void RegisterExternalMessageHandler();

void OnExternalMessage(string message) {
  var data = JsonUtility.FromJson<AuthData>(message);
  PlayerPrefs.SetString("auth_token", data.token);
  PlayerPrefs.SetString("selected_character_id", data.characterId);
}
```

**Option 2: Via URL Parameters (WebGL)**

```
/unity/index.html?token=jwt_token&characterId=char_id
```

```csharp
// Unity reads on startup
void Start() {
  string url = Application.absoluteURL;
  // Parse query parameters
  // Store in PlayerPrefs
}
```

**Option 3: Saved Credentials (Native)**

```csharp
// Native client stores credentials locally
PlayerPrefs.SetString("auth_token", token);
PlayerPrefs.Save();

// On next launch, auto-login if token valid
```

### Unity → React Events

```typescript
// Unity sends message to React
window.parent.postMessage({
  type: 'UNITY_EVENT',
  event: 'PLAYER_DIED',
  data: { respawnTime: 30 }
}, '*');

// React listens
useEffect(() => {
  const handleUnityMessage = (event: MessageEvent) => {
    if (event.data.type === 'UNITY_EVENT') {
      console.log('Unity event:', event.data.event);
    }
  };
  
  window.addEventListener('message', handleUnityMessage);
  return () => window.removeEventListener('message', handleUnityMessage);
}, []);
```

---

## Deployment Strategies

### Development

```
Next.js: http://localhost:3000
API: http://localhost:4000
Game Server: ws://localhost:8080
Unity: WebGL served from /public/unity/ or standalone executable
```

### Production

#### WebGL on Vercel/Netlify

```
Frontend + Unity WebGL: https://yourgame.com
API: https://api.yourgame.com
Game Server: wss://game.yourgame.com
Database: RDS or managed PostgreSQL
```

**Considerations:**
- Unity WebGL bundle size (100-200 MB)
- CDN for static assets
- Compression (Brotli)
- Loading screen during download

#### Native Client + Web API

```
Website: https://yourgame.com (download page)
Native Client: Downloadable executable
API: https://api.yourgame.com
Game Server: wss://game.yourgame.com
```

**Considerations:**
- Auto-updater in client
- Version checking
- Platform-specific builds
- Code signing (Windows/Mac)

---

## Next Steps

1. **Choose Integration Path**
   - WebGL for web-first experience
   - Native for best performance
   - Hybrid for both

2. **Complete Unity Setup**
   - Create scenes in Unity Editor
   - Create prefabs
   - Test in Editor

3. **Build and Integrate**
   - Build Unity project
   - Integrate with Next.js (if WebGL)
   - Test full flow

4. **Deploy**
   - Deploy to staging environment
   - Test with real users
   - Deploy to production

---

## FAQ

### Can I use the existing Next.js game page?

Yes, but it depends on integration path:

- **WebGL**: Replace placeholder with Unity iframe/component
- **Native**: Keep Next.js page as launcher/info page

### Do I need to rewrite the UI?

The Unity client has its own UI system. The Next.js UI can:
- Remain as fallback for non-Unity users
- Be used as launcher interface
- Wrap Unity with web-based overlays (chat, friends)

### How do I handle mobile?

- **WebGL**: Works on mobile browsers (performance varies)
- **Native**: Build Unity iOS/Android apps separately
- **Hybrid**: Detect platform and show appropriate option

### Can both Unity and Next.js coexist?

Yes! Recommended approach:
- Next.js for login, character select, website
- Unity for 3D game world
- Both use same backend APIs

---

**Last Updated**: December 2024  
**Document Version**: 1.0
