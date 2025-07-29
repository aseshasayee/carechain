@echo off
echo 🚀 CareChain Real-time Messaging Setup
echo ======================================

REM Check if Redis is available
redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis is already running!
    goto :test_redis
)

echo ⚠️  Redis is not running. Let's try to start it...

REM Try to start Redis using Docker (most common on Windows)
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 🐳 Docker found, starting Redis container...
    docker run -d --name carechain-redis -p 6379:6379 redis:latest
    timeout /t 3 >nul
    goto :test_redis
)

echo ❌ Redis is not running and Docker is not available
echo.
echo Please start Redis using one of these methods:
echo.
echo 🔧 Option 1 - Docker (Recommended):
echo    docker run -d -p 6379:6379 redis:latest
echo.
echo 🔧 Option 2 - WSL with Linux Redis:
echo    wsl -e sudo service redis-server start
echo.
echo 🔧 Option 3 - Windows Redis binary:
echo    Download from: https://github.com/microsoftarchive/redis/releases
echo    Then run: redis-server.exe
echo.
pause
exit /b 1

:test_redis
echo.
echo 🔧 Testing Redis connection...
redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis connection test successful!
) else (
    echo ❌ Redis connection test failed
    pause
    exit /b 1
)

echo.
echo 📊 Redis Information:
echo Port: 6379
echo Host: localhost
echo Database 0: Celery ^& Channel Layers
echo Database 1: Cache

echo.
echo 🎉 Redis setup complete!
echo.
echo Next steps:
echo 1. Start your Django development server: python manage.py runserver
echo 2. Open candidate_chat.html or recruiter_chat.html
echo 3. Test real-time messaging!
echo.
echo To stop Redis: redis-cli shutdown
echo Or if using Docker: docker stop carechain-redis
echo.
pause
