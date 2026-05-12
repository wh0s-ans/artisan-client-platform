from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.project import Project, ProjectStatus
from app.models.demand import Demand, DemandStatus
from app.models.notification import Notification, NotificationType
from app.schemas.demand import ProjectResponse, StatusUpdate

router = APIRouter()


def _project_response(p: Project) -> dict:
    return {
        "id": p.id, "demand_id": p.demand_id, "quote_id": p.quote_id,
        "artisan_id": p.artisan_id, "client_id": p.client_id,
        "status": p.status.value,
        "started_at": p.started_at, "completed_at": p.completed_at,
        "created_at": p.created_at,
        "demand_title": p.demand.title if p.demand else None,
        "artisan_name": p.artisan.full_name if p.artisan else None,
        "client_name": p.client.full_name if p.client else None,
    }


@router.get("", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Project).filter(
        (Project.client_id == current_user.id) | (Project.artisan_id == current_user.id)
    ).order_by(Project.created_at.desc())
    return [_project_response(p) for p in q.all()]


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    if p.client_id != current_user.id and p.artisan_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Non autorisé")
    return _project_response(p)


@router.put("/{project_id}/status", response_model=ProjectResponse)
def update_project_status(project_id: int, data: StatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    if p.client_id != current_user.id and p.artisan_id != current_user.id:
        raise HTTPException(status_code=403, detail="Non autorisé")
    new_status = ProjectStatus(data.status)
    p.status = new_status
    if new_status == ProjectStatus.en_cours:
        p.started_at = datetime.now(timezone.utc)
        p.demand.status = DemandStatus.en_cours
    elif new_status == ProjectStatus.termine:
        p.completed_at = datetime.now(timezone.utc)
        p.demand.status = DemandStatus.terminee
        other_id = p.artisan_id if current_user.id == p.client_id else p.client_id
        db.add(Notification(user_id=other_id, type=NotificationType.projet, content=f"Projet terminé. Laissez un avis !", related_id=p.id))
    db.commit()
    db.refresh(p)
    return _project_response(p)
