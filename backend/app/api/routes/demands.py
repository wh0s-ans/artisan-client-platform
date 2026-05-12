from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user, require_client
from app.models.user import User
from app.models.demand import Demand, DemandStatus, DemandCategory
from app.schemas.demand import DemandCreate, DemandUpdate, DemandResponse, StatusUpdate

router = APIRouter()


def _demand_response(d: Demand) -> dict:
    return {
        "id": d.id, "client_id": d.client_id, "title": d.title,
        "description": d.description, "category": d.category.value,
        "budget_min": d.budget_min, "budget_max": d.budget_max,
        "localisation": d.localisation, "ville": d.ville,
        "urgence": d.urgence, "status": d.status.value,
        "photos_urls": d.photos_urls or [],
        "created_at": d.created_at, "updated_at": d.updated_at,
        "client_name": d.client.full_name if d.client else None,
        "quotes_count": len(d.quotes) if d.quotes else 0,
    }


@router.post("", response_model=DemandResponse)
def create_demand(data: DemandCreate, db: Session = Depends(get_db), current_user: User = Depends(require_client)):
    demand = Demand(
        client_id=current_user.id, title=data.title, description=data.description,
        category=DemandCategory(data.category),
        budget_min=data.budget_min, budget_max=data.budget_max,
        localisation=data.localisation, ville=data.ville, urgence=data.urgence,
    )
    db.add(demand)
    db.commit()
    db.refresh(demand)
    return _demand_response(demand)


@router.get("", response_model=list[DemandResponse])
def list_demands(
    category: Optional[str] = None, status: Optional[str] = None,
    ville: Optional[str] = None, urgence: Optional[bool] = None,
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    q = db.query(Demand)
    if category:
        q = q.filter(Demand.category == category)
    if status:
        q = q.filter(Demand.status == status)
    if ville:
        q = q.filter(Demand.ville.ilike(f"%{ville}%"))
    if urgence is not None:
        q = q.filter(Demand.urgence == urgence)
    demands = q.order_by(Demand.created_at.desc()).offset(skip).limit(limit).all()
    return [_demand_response(d) for d in demands]


@router.get("/me", response_model=list[DemandResponse])
def my_demands(db: Session = Depends(get_db), current_user: User = Depends(require_client)):
    demands = db.query(Demand).filter(Demand.client_id == current_user.id).order_by(Demand.created_at.desc()).all()
    return [_demand_response(d) for d in demands]


@router.get("/{demand_id}", response_model=DemandResponse)
def get_demand(demand_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    d = db.query(Demand).filter(Demand.id == demand_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    return _demand_response(d)


@router.put("/{demand_id}", response_model=DemandResponse)
def update_demand(demand_id: int, data: DemandUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_client)):
    d = db.query(Demand).filter(Demand.id == demand_id, Demand.client_id == current_user.id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(d, field, value)
    db.commit()
    db.refresh(d)
    return _demand_response(d)


@router.put("/{demand_id}/status", response_model=DemandResponse)
def update_demand_status(demand_id: int, data: StatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    d = db.query(Demand).filter(Demand.id == demand_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    if d.client_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Non autorisé")
    d.status = DemandStatus(data.status)
    db.commit()
    db.refresh(d)
    return _demand_response(d)


@router.delete("/{demand_id}")
def delete_demand(demand_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_client)):
    d = db.query(Demand).filter(Demand.id == demand_id, Demand.client_id == current_user.id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    d.status = DemandStatus.annulee
    db.commit()
    return {"detail": "Demande annulée"}
