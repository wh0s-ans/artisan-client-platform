# Artisan Client Platform

A full-stack platform for connecting **Artisans** with **Clients**. Clients post service demands, artisans submit proposals, and both parties can communicate and rate each other.

## Project Structure

```
artisan-client-platform/
├── backend/                  # Python FastAPI backend
│   ├── main.py               # API routes & app entry point
│   ├── models.py             # SQLAlchemy database models
│   ├── database.py           # Database connection & settings
│   ├── auth.py               # JWT authentication & password hashing
│   ├── init_db.py            # Database initialization script
│   ├── create_db.py          # Database creation helper
│   ├── test_db.py            # Database connection test
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Backend Docker image
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Shared components
│   │   ├── context/          # React context (auth)
│   │   ├── api/              # API client
│   │   └── utils/            # Utility functions
│   ├── index.html            # HTML entry point
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── nginx.conf            # Nginx config (production)
│   └── Dockerfile            # Frontend Docker image
├── infrastructure/           # AWS CloudFormation templates
├── .github/workflows/        # CI/CD pipeline
├── docker-compose.yml        # Local development with Docker
├── .env.example              # Environment variables template
├── .replit                   # Replit configuration
├── replit.nix                # Nix packages for Replit
├── setup.sh                  # Linux/Mac setup script
└── setup.bat                 # Windows setup script
```

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| **Backend**    | Python, FastAPI, SQLAlchemy, Uvicorn |
| **Frontend**   | React, Vite, React Router           |
| **Database**   | PostgreSQL                          |
| **Auth**       | JWT (python-jose), bcrypt           |
| **Deploy**     | Docker, AWS ECS, GitHub Actions     |

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 15+

### Backend

```bash
cd backend
pip install -r requirements.txt
python create_db.py          # Create the database
python init_db.py            # Initialize tables
uvicorn main:app --reload    # Start dev server on :8000
```

API docs available at: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev                  # Start dev server on :5173
```

### Docker (full stack)

```bash
docker-compose up --build    # Starts PostgreSQL + Backend + Frontend
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## API Endpoints

| Method   | Endpoint                        | Description                  | Auth  |
|----------|---------------------------------|------------------------------|-------|
| `POST`   | `/auth/register`                | Register a new user          | No    |
| `POST`   | `/auth/login`                   | Login, get JWT token         | No    |
| `GET`    | `/auth/me`                      | Get current user profile     | Yes   |
| `GET`    | `/users`                        | List users (filter by type)  | No    |
| `GET`    | `/users/{id}`                   | Get user by ID               | No    |
| `PUT`    | `/users/profile`                | Update own profile           | Yes   |
| `GET`    | `/demands`                      | List all demands             | No    |
| `POST`   | `/demands`                      | Create a demand              | Yes   |
| `GET`    | `/demands/{id}`                 | Get demand by ID             | No    |
| `GET`    | `/demands/my/list`              | Get own demands              | Yes   |
| `PATCH`  | `/demands/{id}/status`          | Update demand status         | Yes   |
| `GET`    | `/demands/{id}/proposals`       | Get proposals for a demand   | No    |
| `POST`   | `/proposals`                    | Submit a proposal            | Yes   |
| `GET`    | `/proposals/my/list`            | Get own proposals            | Yes   |
| `PATCH`  | `/proposals/{id}/status`        | Accept/reject a proposal     | Yes   |
| `POST`   | `/messages`                     | Send a message               | Yes   |
| `GET`    | `/demands/{id}/messages`        | Get messages for a demand    | No    |
| `GET`    | `/messages/conversations`       | Get user's conversations     | Yes   |
| `POST`   | `/ratings`                      | Create a rating              | Yes   |
| `GET`    | `/users/{id}/ratings`           | Get user's ratings           | No    |
| `GET`    | `/artisans/search`              | Search artisans              | No    |
| `GET`    | `/stats/dashboard`              | Get dashboard stats          | Yes   |
| `GET`    | `/health`                       | Health check                 | No    |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/artisan_platform
SECRET_KEY=your-secret-key
VITE_API_URL=http://localhost:8000
```

## Deployment

### Replit

The project is configured for Replit deployment. Just click **Run**.

### Docker + AWS

1. Run `./setup.sh` (Linux/Mac) or `setup.bat` (Windows)
2. Configure AWS credentials: `aws configure`
3. Add GitHub secrets: `AWS_ACCOUNT_ID`
4. Push to `main` branch — CI/CD handles the rest

See `infrastructure/cloudformation.yml` for the full AWS stack definition.
