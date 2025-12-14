#!/bin/bash
# Development script for game server (Unix/Mac/Git Bash)
cd "$(dirname "$0")"
go run cmd/server/main.go
