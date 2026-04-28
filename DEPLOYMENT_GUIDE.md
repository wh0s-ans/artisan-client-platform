# Guide de Déploiement - Docker & AWS

## 🐳 1. Démarrage Local avec Docker

### Tester localement avant de déployer

```bash
# Construire les images
docker-compose build

# Démarrer les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### URL d'accès
- Frontend : http://localhost:3000
- Backend : http://localhost:8000
- API Docs : http://localhost:8000/docs

---

## 🚀 2. Déploiement sur AWS

### Étape 1 : Préparation du code
```bash
# S'assurer que le code est commité
git add .
git commit -m "feat: Prepare for AWS deployment"
git push origin main
```

### Étape 2 : Configuration AWS CLI
```bash
# Configurer les credentials
aws configure

# Vérifier la connexion
aws sts get-caller-identity
```

### Étape 3 : Créer les ECR Repositories
```bash
# Backend
aws ecr create-repository \
  --repository-name projet-backend \
  --region us-east-1

# Frontend
aws ecr create-repository \
  --repository-name projet-frontend \
  --region us-east-1
```

### Étape 4 : Configuration des Secrets GitHub
1. Aller sur votre repo GitHub
2. Settings → Secrets and variables → Actions
3. Ajouter les secrets :
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### Étape 5 : Le déploiement se fera automatiquement
- Push sur `main` déclenche le pipeline GitHub Actions
- Les tests tournent
- Les images Docker sont construites et poussées vers ECR
- Le service ECS est mis à jour automatiquement

---

## 📝 Fichiers de configuration

### Structure du projet après configuration

```
Projet-stage/
├── .github/
│   └── workflows/
│       ├── deploy.yml       # Pipeline de déploiement
│       └── test.yml         # Pipeline de tests
├── backend/
│   ├── Dockerfile           # Image Docker backend
│   ├── requirements.txt      # Dépendances Python
│   ├── main.py
│   ├── models.py
│   └── database.py
├── frontend/
│   ├── Dockerfile           # Image Docker frontend
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       └── App.jsx
├── docker-compose.yml       # Orchestration locale
├── .dockerignore
├── AWS_SETUP.md            # Guide AWS détaillé
└── DEPLOYMENT_GUIDE.md     # Ce fichier
```

---

## 🔍 Monitoring

### CloudWatch Logs
```bash
# Voir les logs en temps réel
aws logs tail /ecs/projet-backend --follow

aws logs tail /ecs/projet-frontend --follow
```

### Alertes
Configurer CloudWatch Alarms pour :
- CPU usage > 80%
- Memory usage > 80%
- Erreurs 5xx
- Latence > 1 seconde

---

## 🆘 Troubleshooting

### Les tests ne passent pas
```bash
# Vérifier les logs GitHub Actions
# Aller sur Settings → Actions → Recent workflows
# Cliquer sur le workflow échoué pour voir les détails
```

### Erreur de connexion à ECR
```bash
# Re-configurer AWS
aws configure

# Vérifier les permissions IAM
# L'utilisateur AWS doit avoir accès à ECR
```

### Service ECS ne démarre pas
```bash
# Vérifier l'état du service
aws ecs describe-services \
  --cluster projet-cluster \
  --services projet-service

# Voir les erreurs des tasks
aws ecs describe-tasks \
  --cluster projet-cluster \
  --tasks <task-arn>
```

---

## ✅ Checklist de déploiement

- [ ] Code poussé sur GitHub
- [ ] Tests passent localement
- [ ] Secrets AWS configurés dans GitHub
- [ ] ECR repositories créés
- [ ] ECS cluster configuré
- [ ] ALB (Application Load Balancer) configuré
- [ ] Domain name pointant vers l'ALB
- [ ] HTTPS/SSL configuré via ACM
- [ ] CloudWatch monitoring actif
- [ ] Logs configurés

---

## 📊 Coûts estimés (par mois)

- **ECS Fargate** : ~$15-40 (2 tasks)
- **ECR** : ~$0.50 (stockage des images)
- **Load Balancer** : ~$15-20
- **Data Transfer** : Gratuit (1GB/mois)
- **CloudWatch** : ~$10

**Total estimé : ~$40-65/mois**

---

## 🎯 Prochaines étapes

1. ✅ Configurer AWS
2. ✅ Déployer sur ECS
3. 🔄 Configurer le domaine
4. 🔒 Activer HTTPS
5. 📊 Mettre en place le monitoring
6. 🚀 Configurer l'auto-scaling
