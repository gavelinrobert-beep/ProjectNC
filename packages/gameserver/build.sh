#!/bin/bash
# Build script for game server (Unix/Mac/Git Bash)
cd "$(dirname "$0")"
go build -o gameserver cmd/server/main.go
