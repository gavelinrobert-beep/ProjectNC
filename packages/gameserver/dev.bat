@echo off
REM Development script for game server (Windows Command Prompt)
cd /d "%~dp0"
go run cmd/server/main.go
