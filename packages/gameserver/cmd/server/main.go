package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/mmorpg/gameserver/internal/network"
	"github.com/mmorpg/gameserver/internal/world"
)

const (
	// Server configuration
	Port     = ":8080"
	TickRate = 20 // ticks per second (50ms per tick)
)

func main() {
	fmt.Println("🎮 Fantasy MMORPG - Game Server")
	fmt.Println("================================")

	// Initialize game world
	gameWorld := world.NewWorld()
	fmt.Println("✅ World initialized")

	// Initialize network manager
	networkManager := network.NewManager(gameWorld)
	fmt.Println("✅ Network manager ready")

	// Start game loop in a goroutine
	go startGameLoop(gameWorld, TickRate)

	// Setup WebSocket endpoint
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		networkManager.HandleConnection(w, r)
	})

	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","players":` + fmt.Sprintf("%d", networkManager.GetPlayerCount()) + `}`))
	})

	// Start server
	fmt.Printf("🚀 Game Server listening on ws://localhost%s/ws\n", Port)
	fmt.Printf("📊 Tick Rate: %d Hz\n", TickRate)
	
	if err := http.ListenAndServe(Port, nil); err != nil {
		log.Fatal("Server failed:", err)
	}
}

// startGameLoop runs the main game simulation loop at a fixed tick rate
// This ensures deterministic gameplay and consistent world state updates
func startGameLoop(w *world.World, tickRate int) {
	tickDuration := time.Second / time.Duration(tickRate)
	ticker := time.NewTicker(tickDuration)
	defer ticker.Stop()

	fmt.Println("🔄 Game loop started")

	for range ticker.C {
		// Calculate delta time
		deltaTime := float64(tickDuration) / float64(time.Second)

		// Update world state
		// This includes:
		// - Entity movement
		// - Combat calculations
		// - AI behavior
		// - Cooldown updates
		w.Update(deltaTime)
	}
}
