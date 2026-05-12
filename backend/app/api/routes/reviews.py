from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.project import Project, ProjectStatus
from app.models.review import Review, ReviewerRole
from app.models.artisan_profile import ArtisanProfile
from app.models.client_profile import ClientProfile
from app.models.notification import Notification, NotificationType
from app.schemas.demand import ReviewCreate, ReviewResponse

router = APIRouter()


def _review_response(r: Review) -> dict:
    return {
        "id": r.id, "project_id": r.project_id,
        "reviewer_id": r.reviewer_id, "reviewed_id": r.reviewed_id,
        "reviewer_role": r.reviewer_role.value, "rating": r.rating,
        "qualite_travail": r.qualite_travail, "respect_delai": r.respect_delai,
        "communication": r.communication, "rapport_qualite_prix": r.rapport_qualite_prix,
        "commentaire": r.commentaire, "created_at": r.created_at,
        "reviewer_name": r.reviewer.full_name if r.reviewer else None,
    }


def _recalc_rating(db: Session, user_id: int, role: str):
    avg = db.query(sqlfunc.avg(Review.rating)).filter(Review.reviewed_id == user_id).scalar() or 0
    count = db.query(Review).filter(Review.reviewed_id == user_id).count()
    if role == "artisan":
        profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == user_id).first()
        if profile:
            profile.rating_avg = round(float(avg), 2)
            profile.reviews_count = count
    else:
        profile = db.query(ClientProfile).filter(ClientProfile.user_id == user_id).first()
        if profile:
            profile.rating_avg = round(float(avg), 2)


@router.post("/projects/{project_id}/reviews", response_model=ReviewResponse)
def create_review(project_id: int, data: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    if project.status != ProjectStatus.termine:
        raise HTTPException(status_code=400, detail="Le projet doit être terminé")
    if project.client_id != current_user.id and project.artisan_id != current_user.id:
        raise HTTPException(status_code=403, detail="Non autorisé")

    reviewed_id = project.artisan_id if current_user.id == project.client_id else project.client_id
    reviewer_role = ReviewerRole.client if current_user.id == project.client_id else ReviewerRole.artisan

    existing = db.query(Review).filter(Review.project_id == project_id, Review.reviewer_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà laissé un avis")

    review = Review(
        project_id=project_id, reviewer_id=current_user.id,
        reviewed_id=reviewed_id, reviewer_role=reviewer_role,
        rating=data.rating, qualite_travail=data.qualite_travail,
        respect_delai=data.respect_delai, communication=data.communication,
        rapport_qualite_prix=data.rapport_qualite_prix, commentaire=data.commentaire,
    )
    db.add(review)
    db.add(Notification(user_id=reviewed_id, type=NotificationType.avis, content=f"Nouvel avis de {current_user.full_name}", related_id=project_id))
    db.flush()

    reviewed_user = db.query(User).filter(User.id == reviewed_id).first()
    _recalc_rating(db, reviewed_id, reviewed_user.role.value if reviewed_user else "client")

    db.commit()
    db.refresh(review)
    return _review_response(review)


@router.get("/artisans/{artisan_id}/reviews", response_model=list[ReviewResponse])
def get_artisan_reviews(artisan_id: int, db: Session = Depends(get_db)):
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.id == artisan_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Artisan introuvable")
    reviews = db.query(Review).filter(Review.reviewed_id == profile.user_id).order_by(Review.created_at.desc()).all()
    return [_review_response(r) for r in reviews]


@router.get("/users/{user_id}/reviews", response_model=list[ReviewResponse])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.reviewed_id == user_id).order_by(Review.created_at.desc()).all()
    return [_review_response(r) for r in reviews]
