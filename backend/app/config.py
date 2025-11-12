"""
Configuration module for Aegis backend application.
Contains all environment variables and configuration settings.
"""
import os

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")

# CORS Configuration
origins_env = (os.getenv("CORS_ORIGINS", "*") or "*").strip()
if origins_env == "*":
    _ALLOW_ALL_ORIGINS = True
    ALLOWED_ORIGINS = ["*"]
else:
    _ALLOW_ALL_ORIGINS = False
    ALLOWED_ORIGINS = [o.strip() for o in origins_env.split(",") if o.strip()]

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_EXP_MIN = int(os.getenv("JWT_EXP_MIN", "120"))

# Weather API Configuration
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
