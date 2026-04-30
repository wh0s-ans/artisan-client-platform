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
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Shared components
│   │   ├── context/          # React context (auth)
│   │   ├── api/              # API client
│   │   └── utils/            # Utility functions
│   ├── index.html            # HTML entry point
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
├── .github/workflows/        # CI pipeline (tests & linting)
├── .env.example              # Environment variables template
├── .replit                   # Replit run configuration
└── replit.nix                # Nix packages for Replit
```

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| **Backend**    | Python, FastAPI, SQLAlchemy, Uvicorn |
| **Frontend**   | React, Vite, React Router           |
| **Database**   | PostgreSQL                          |
| **Auth**       | JWT (python-jose), bcrypt           |
| **Hosting**    | Replit                              |
| **CI**         | GitHub Actions                      |

## Getting Started

### On Replit (Recommended)

1. Import the repo on [Replit](https://replit.com)
2. Replit will auto-detect PostgreSQL and Python
3. Click **Run** — the backend starts automatically on port 8000
4. The frontend can be built and served by the backend in production

### Local Development

#### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 15+

#### Backend
```bash
cd backend
pip install -r requirements.txt
python create_db.py          # Create the database
python init_db.py            # Initialize tables
uvicorn main:app --reload    # Start dev server on :8000
```

API docs: `http://localhost:8000/docs`

#### Frontend
```bash
cd frontend
npm install
npm run dev                  # Start dev server on :5173
```

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

## Deployment on Replit

1. Push your code to GitHub
2. Import the repo on Replit
3. Set environment variables in Replit Secrets:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `SECRET_KEY` — a secure random string for JWT
4. Click **Run** — the app starts automatically
5. Use **Deploy** tab to publish your app with a custom domain
