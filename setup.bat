@echo off
REM User Manager - AWS + Docker Setup Script for Windows

setlocal enabledelayedexpansion

echo ================================
echo 🚀 User Manager Setup Script
echo ================================
echo.

REM Check prerequisites
echo 📋 Verifying prerequisites...
echo.

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed
    exit /b 1
)
echo ✓ Docker

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed
    exit /b 1
)
echo ✓ Docker Compose

REM Check Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed
    exit /b 1
)
echo ✓ Git

echo.

REM Create .env file if not exists
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ✓ .env created (edit it according to your needs)
) else (
    echo ℹ .env already exists
)
echo.

REM Initialize git if needed
if not exist .git (
    echo 🔧 Initializing Git repository...
    git init
    git branch -M main
    echo ✓ Git repository initialized
) else (
    echo ✓ Git repository already exists
)
echo.

REM Build images
echo 🐳 Building Docker images...
docker-compose build
echo ✓ Docker images built
echo.

REM Start services
echo 🚀 Starting services...
docker-compose up -d
echo ✓ Services started
echo.

REM Wait for services
echo ⏳ Waiting for services to start...
timeout /t 5 /nobreak
echo.

REM Check services health
echo 🏥 Checking services health...
echo.

docker-compose ps | findstr "postgres" >nul
if not errorlevel 1 (
    echo ✓ PostgreSQL - http://localhost:5432
)

docker-compose ps | findstr "backend" >nul
if not errorlevel 1 (
    echo ✓ Backend - http://localhost:8000
    echo   📖 API Docs: http://localhost:8000/docs
)

docker-compose ps | findstr "frontend" >nul
if not errorlevel 1 (
    echo ✓ Frontend - http://localhost
)

echo.
echo ================================
echo ✨ Setup complete!
echo ================================
echo.
echo 📖 Next steps:
echo.
echo 1. AWS Configuration:
echo    aws configure
echo.
echo 2. Create ECR repositories:
echo    aws ecr create-repository --repository-name user-manager-backend --region us-east-1
echo    aws ecr create-repository --repository-name user-manager-frontend --region us-east-1
echo.
echo 3. Add GitHub secrets:
echo    - AWS_ACCOUNT_ID
echo    - AWS_REGION (optional, default: us-east-1)
echo.
echo 4. Read documentation:
echo    - DEPLOYMENT.md - Deployment guide
echo    - README.md - General documentation
echo    - infrastructure\README.md - AWS Infrastructure
echo.
echo 5. Push to trigger CI/CD:
echo    git add .
echo    git commit -m "Initial commit with Docker and CI/CD"
echo    git push origin main
echo.
echo 🎉 You're ready!
echo.
pause
