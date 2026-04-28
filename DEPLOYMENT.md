# Setup Guide: Docker + AWS + GitHub Actions

## 📋 Prérequis

- Git et GitHub
- Docker installé localement
- Compte AWS
- GitHub account avec accès au repository

---

## 🐳 1. Tester Docker localement

### Démarrer les services avec Docker Compose
```bash
docker-compose up -d
```

Cela va lancer :
- **PostgreSQL** sur `localhost:5432`
- **Backend FastAPI** sur `localhost:8000`
- **Frontend React** sur `localhost:80`

### Vérifier le status
```bash
docker-compose ps
```

### Arrêter les services
```bash
docker-compose down
```

---

## 🚀 2. Configuration AWS

### 2.1 Créer une IAM Role pour GitHub Actions

1. Allez sur **AWS Console** → **IAM** → **Roles**
2. Créez un nouveau rôle avec **Web identity**
3. Sélectionnez **GitHub** comme provider
4. Dans le token audience, entrez : `sts.amazonaws.com`
5. Sélectionnez votre GitHub org/user et repository

### 2.2 Attacher les permissions

Créez une policy JSON et attachez-la au rôle :

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchGetImage",
                "ecr:GetDownloadUrlForLayer",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ecs:UpdateService",
                "ecs:DescribeServices"
            ],
            "Resource": "arn:aws:ecs:*:*:service/user-manager-cluster/*"
        }
    ]
}
```

### 2.3 Créer ECR Repositories

```bash
# Backend
aws ecr create-repository \
    --repository-name user-manager-backend \
    --region us-east-1

# Frontend
aws ecr create-repository \
    --repository-name user-manager-frontend \
    --region us-east-1
```

---

## 🔐 3. Secrets GitHub

Allez sur **GitHub** → **Settings** → **Secrets and variables** → **Actions**

Ajoutez ces secrets :

```
AWS_ACCOUNT_ID = your-12-digit-account-id
AWS_REGION = us-east-1
```

Récupérez votre Account ID :
```bash
aws sts get-caller-identity --query Account --output text
```

---

## 📦 4. Infrastructure AWS (ECS)

### Option A : Déployer manuellement

Créez un cluster ECS :
```bash
aws ecs create-cluster --cluster-name user-manager-cluster
```

Créez des task definitions pour backend et frontend (voir documentation AWS ECS).

### Option B : Utiliser CloudFormation/Terraform

Créez un fichier `infrastructure/cloudformation.yml` pour automatiser.

---

## 🔄 5. GitHub Actions Workflow

Deux workflows ont été créés :

### `deploy.yml` - Build et Deploy
- Déclenché à chaque push sur `main` ou `develop`
- Construit les images Docker
- Les pousse dans ECR
- Déploie sur AWS ECS

### `test.yml` - Tests et Linting
- Vérifie la qualité du code (Python + JS)
- Lance les tests unitaires
- Scanne les vulnérabilités

---

## ✅ 6. Workflow de déploiement

```
1. Commitez votre code
2. Poussez sur GitHub
   ↓
3. GitHub Actions démarre
   - Build des images Docker
   - Push vers ECR
   - Déploie sur ECS
   ↓
4. Vérifiez le déploiement
   aws ecs describe-services --cluster user-manager-cluster --services user-manager-backend-service
```

---

## 🔗 7. URLs de production

Après le déploiement :
- **Frontend** : `https://your-alb-dns.elb.amazonaws.com`
- **Backend API** : `https://your-alb-dns.elb.amazonaws.com/api`

---

## 📝 Checklist d'intégration

- [ ] Docker Compose fonctionne localement
- [ ] Compte AWS créé et configuré
- [ ] IAM Role créée pour GitHub
- [ ] ECR Repositories créés
- [ ] Secrets GitHub ajoutés
- [ ] ECS Cluster + Services configurés
- [ ] GitHub Actions workflows actifs

---

## 🐛 Troubleshooting

### Images Docker ne build pas
```bash
docker build -t user-manager-backend ./backend
```

### ECR Login échoue
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### ECS Service ne met pas à jour
- Vérifiez la IAM Role GitHub
- Vérifiez les permissions ECS
- Consultez CloudWatch Logs

---

## 📚 Ressources

- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Docker Compose](https://docs.docker.com/compose/)
