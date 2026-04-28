# Configuration AWS pour le projet

## 📋 Prérequis
- Compte AWS actif
- AWS CLI installé et configuré
- Docker et Docker Compose installés
- Repository GitHub connecté à votre compte

## 🚀 Étapes de configuration

### 1. Créer les repositories ECR (Elastic Container Registry)

```bash
# Repository pour le backend
aws ecr create-repository \
  --repository-name projet-backend \
  --region us-east-1

# Repository pour le frontend
aws ecr create-repository \
  --repository-name projet-frontend \
  --region us-east-1
```

### 2. Créer les secrets GitHub Actions

Allez dans : **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Ajoutez les secrets suivants :
- `AWS_ACCESS_KEY_ID` : Votre clé d'accès AWS
- `AWS_SECRET_ACCESS_KEY` : Votre clé secrète AWS

### 3. Créer un Cluster ECS (Elastic Container Service)

```bash
# Créer le cluster
aws ecs create-cluster \
  --cluster-name projet-cluster \
  --region us-east-1

# Enregistrer une task definition pour le backend
aws ecs register-task-definition \
  --cli-input-json file://task-definition-backend.json \
  --region us-east-1

# Enregistrer une task definition pour le frontend
aws ecs register-task-definition \
  --cli-input-json file://task-definition-frontend.json \
  --region us-east-1
```

### 4. Créer le Load Balancer (ALB)

```bash
# Créer le security group
aws ec2 create-security-group \
  --group-name projet-alb-sg \
  --description "Security group for ALB" \
  --region us-east-1

# Créer l'ALB
aws elbv2 create-load-balancer \
  --name projet-alb \
  --subnets subnet-xxxxxx subnet-yyyyy \
  --security-groups sg-xxxxxx \
  --region us-east-1
```

### 5. Déployer un service ECS

```bash
# Créer le service
aws ecs create-service \
  --cluster projet-cluster \
  --service-name projet-service \
  --task-definition projet-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --region us-east-1
```

## 🔐 Configuration des variables d'environnement

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@db-instance.amazonaws.com:5432/projet
ENVIRONMENT=production
API_KEY=your-api-key
```

### Frontend (.env.production)
```
VITE_API_URL=https://api.yourdomain.com
```

## 📊 Architecture AWS proposée

```
┌─────────────────────────────────────────┐
│         GitHub Actions CI/CD            │
└────────────────┬────────────────────────┘
                 │
                 ├─→ ECR (Backend & Frontend)
                 │
                 └─→ ECS Cluster
                     ├─→ Backend Task (Fargate)
                     ├─→ Frontend Task (Fargate)
                     └─→ RDS (Database optionnel)
                         ├─→ Application Load Balancer
                         └─→ CloudFront (CDN)
```

## 📱 Endpoints après déploiement

- **Frontend** : `https://your-domain.com`
- **Backend API** : `https://api.your-domain.com`
- **API Docs** : `https://api.your-domain.com/docs`

## 💰 Optimisation des coûts

- Utilisez **AWS Free Tier** (12 mois gratuits pour nouveaux utilisants)
- Configurez **Auto Scaling** pour réduire les coûts
- Utilisez **CloudFront** pour mettre en cache le frontend
- Optez pour **RDS Multi-AZ** seulement en production

## 🔧 Monitoring et Logs

```bash
# Voir les logs d'une task
aws ecs describe-tasks \
  --cluster projet-cluster \
  --tasks <task-arn> \
  --region us-east-1

# Voir les métriques CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=projet-service \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 300 \
  --statistics Average
```

## 📚 Ressources utiles

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [GitHub Actions AWS Integration](https://github.com/aws-actions)
- [AWS Free Tier](https://aws.amazon.com/free/)
