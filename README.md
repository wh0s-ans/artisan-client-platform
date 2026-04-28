# 👥 User Manager - Full Stack Application

Application complète **FastAPI + React** avec **Docker** et **CI/CD sur AWS**.

## 🎯 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    GitHub Actions                    │
│  (Tests, Build, Push to ECR, Deploy to ECS)          │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼───────┐        ┌───▼────────┐
    │   ECR     │        │   ECR      │
    │ (Backend) │        │ (Frontend) │
    └───┬───────┘        └───┬────────┘
        │                     │
        │   AWS ECS Cluster   │
        └──────────┬──────────┘
             ┌─────▼──────┐
             │    ALB     │
             └─────┬──────┘
                   │
         ┌─────────┴─────────┐
         │                   │
      ┌──▼─────┐         ┌──▼──────┐
      │Backend │         │ Frontend │
      │  Task  │         │  Task    │
      └──┬─────┘         └─────────┘
         │
      ┌──▼──────────┐
      │ RDS (PostgSQL)
      └──────────────┘
```

## 📦 Structure du Projet

```
Projet-stage/
├── backend/                    # FastAPI Application
│   ├── main.py                 # Endpoints FastAPI
│   ├── models.py               # SQLAlchemy Models
│   ├── database.py             # Database Configuration
│   ├── requirements.txt         # Python Dependencies
│   └── Dockerfile              # Backend Container
├── frontend/                   # React Application
│   ├── src/
│   │   ├── App.jsx             # Main Component
│   │   ├── App.css             # Styles
│   │   └── main.jsx
│   ├── package.json
│   ├── Dockerfile              # Frontend Container
│   └── nginx.conf              # Nginx Configuration
├── .github/workflows/          # GitHub Actions
│   ├── deploy.yml              # Build & Deploy Pipeline
│   └── test.yml                # Test & Lint Pipeline
├── infrastructure/             # AWS Infrastructure
│   ├── cloudformation.yml      # CloudFormation Template
│   └── README.md
├── docker-compose.yml          # Local Development
├── DEPLOYMENT.md               # Deployment Guide
└── .gitignore

```

## 🚀 Quick Start

### 1️⃣ Développement Local

```bash
# Cloner le repo
git clone <repo-url>
cd Projet-stage

# Démarrer les services
docker-compose up -d

# Accéder à l'application
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### 2️⃣ Tests

```bash
# Tests Backend
pytest backend/tests -v

# Tests Frontend
npm run lint && npm run build
```

### 3️⃣ Déployer sur AWS

```bash
# Configurer AWS
aws configure

# Créer l'infrastructure
aws cloudformation create-stack \
    --stack-name user-manager \
    --template-body file://infrastructure/cloudformation.yml \
    --parameters ParameterKey=DBPassword,ParameterValue=YourPassword

# Pusher le code
git push origin main  # GitHub Actions s'occupe du reste!
```

## 🔧 Configuration

### Variables d'Environnement

Créez `.env` à partir de `.env.example` :

```bash
# Backend
DATABASE_URL=postgresql://postgres:whosans@postgres:5432/stage_db
BACKEND_CORS_ORIGINS=["http://localhost", "http://localhost:5173"]

# Frontend
VITE_API_URL=http://localhost:8000

# AWS
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### `test.yml` - À chaque commit
- ✅ Unit Tests (Backend + Frontend)
- ✅ Linting & Code Quality
- ✅ Security Scanning
- ✅ Build Verification

#### `deploy.yml` - Sur push vers `main`
- 🐳 Build Docker Images
- 📤 Push vers AWS ECR
- 🚀 Deploy sur ECS
- ✅ Health Checks

### Ajout des Secrets GitHub

1. Allez dans **Settings** → **Secrets and variables** → **Actions**
2. Ajoutez :
   - `AWS_ACCOUNT_ID` - Your AWS Account ID
   - `AWS_REGION` - e.g., `us-east-1`

## 📝 API Endpoints

### GET `/users`
Liste tous les utilisateurs.

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

### POST `/users?name=...&email=...`
Crée un nouvel utilisateur.

**Parameters:**
- `name` (string) - User name
- `email` (string) - User email

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

## 🛠 Commandes Utiles

### Local Development
```bash
# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Arrêter les services
docker-compose down

# Reconstruire les images
docker-compose build --no-cache
```

### AWS Commands
```bash
# Login ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Voir les services ECS
aws ecs list-services --cluster user-manager-cluster

# Voir les logs ECS
aws logs tail /ecs/user-manager-backend --follow
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 8000 already in use | `lsof -ti:8000 \| xargs kill -9` |
| Docker Compose fails | `docker system prune -a` then retry |
| GitHub Actions fails | Check CloudWatch logs: `aws logs tail /ecs/...` |
| Database connection error | Verify `DATABASE_URL` in `.env` |

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Infrastructure Setup](./infrastructure/README.md)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://react.dev)
- [AWS ECS Guide](https://docs.aws.amazon.com/ecs/)

## 🤝 Contributing

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Commitez vos changements (`git commit -m 'Add amazing feature'`)
4. Poussez la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 License

MIT License - voir `LICENSE` pour les détails.

---

**Créé avec ❤️ pour la gestion d'utilisateurs moderne.**
