#!/bin/bash

# User Manager - AWS + Docker Setup Script
# Ce script configure automatiquement le projet pour AWS + GitHub Actions

set -e

echo "================================"
echo "🚀 User Manager Setup Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
echo "📋 Vérification des prérequis..."
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose${NC}"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git${NC}"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${YELLOW}⚠ AWS CLI n'est pas installé (nécessaire pour AWS)${NC}"
fi
echo ""

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env créé (à modifier selon vos besoins)${NC}"
else
    echo -e "${YELLOW}ℹ .env existe déjà${NC}"
fi
echo ""

# Initialize git if needed
if [ ! -d .git ]; then
    echo "🔧 Initialisation du repository Git..."
    git init
    git branch -M main
    echo -e "${GREEN}✓ Repository Git initialisé${NC}"
else
    echo -e "${GREEN}✓ Repository Git existe déjà${NC}"
fi
echo ""

# Build images
echo "🐳 Build des images Docker..."
docker-compose build
echo -e "${GREEN}✓ Images Docker construites${NC}"
echo ""

# Start services
echo "🚀 Démarrage des services..."
docker-compose up -d
echo -e "${GREEN}✓ Services démarrés${NC}"
echo ""

# Wait for services to be ready
echo "⏳ Attente du démarrage des services..."
sleep 5

# Check services health
echo "🏥 Vérification de la santé des services..."
echo ""

if docker-compose ps | grep -q "postgres.*Up"; then
    echo -e "${GREEN}✓ PostgreSQL${NC} - http://localhost:5432"
fi

if docker-compose ps | grep -q "backend.*Up"; then
    echo -e "${GREEN}✓ Backend${NC} - http://localhost:8000"
    echo "  📖 API Docs: http://localhost:8000/docs"
fi

if docker-compose ps | grep -q "frontend.*Up"; then
    echo -e "${GREEN}✓ Frontend${NC} - http://localhost"
fi

echo ""
echo "================================"
echo "✨ Configuration complète!"
echo "================================"
echo ""
echo "📖 Prochaines étapes:"
echo ""
echo "1. Configuration AWS:"
echo "   aws configure"
echo ""
echo "2. Créer les repositories ECR:"
echo "   aws ecr create-repository --repository-name user-manager-backend --region us-east-1"
echo "   aws ecr create-repository --repository-name user-manager-frontend --region us-east-1"
echo ""
echo "3. Ajouter les secrets GitHub:"
echo "   - AWS_ACCOUNT_ID"
echo "   - AWS_REGION (optionnel, par défaut: us-east-1)"
echo ""
echo "4. Lire la documentation:"
echo "   - DEPLOYMENT.md - Guide de déploiement"
echo "   - README.md - Documentation générale"
echo "   - infrastructure/README.md - Infrastructure AWS"
echo ""
echo "5. Faire un push pour déclencher le CI/CD:"
echo "   git add ."
echo "   git commit -m 'Initial commit with Docker and CI/CD'"
echo "   git push origin main"
echo ""
echo "🎉 C'est prêt!"
