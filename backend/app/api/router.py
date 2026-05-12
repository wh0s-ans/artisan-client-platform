from fastapi import APIRouter
from app.api.routes import auth, users, artisans, demands, quotes, projects, messages, reviews, notifications, search, admin

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(artisans.router, prefix="/artisans", tags=["Artisans"])
router.include_router(demands.router, prefix="/demands", tags=["Demands"])
router.include_router(quotes.router, prefix="/quotes", tags=["Quotes"])
router.include_router(projects.router, prefix="/projects", tags=["Projects"])
router.include_router(messages.router, prefix="", tags=["Messages"])
router.include_router(reviews.router, prefix="", tags=["Reviews"])
router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
router.include_router(search.router, prefix="/search", tags=["Search"])
router.include_router(admin.router, prefix="/admin", tags=["Admin"])
