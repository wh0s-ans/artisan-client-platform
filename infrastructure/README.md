# 🚀 Infrastructure as Code - CloudFormation

Ce template CloudFormation crée toute l'infrastructure AWS nécessaire.

## Usage

```bash
aws cloudformation create-stack \
    --stack-name user-manager-stack \
    --template-body file://infrastructure/cloudformation.yml \
    --capabilities CAPABILITY_IAM
```

## Resources créées
- ECS Cluster
- ECR Repositories
- RDS (PostgreSQL)
- Application Load Balancer
- Security Groups
- IAM Roles
