@echo off
REM Build script for game server (Windows Command Prompt)
cd /d "%~dp0"
go build -o gameserver.exe cmd/server/main.go
