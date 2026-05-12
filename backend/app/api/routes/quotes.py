from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_artisan, require_client
from app.models.user import User
from app.models.demand import Demand, DemandStatus
from app.models.quote import Quote, QuoteStatus
from app.models.project import Project
from app.models.notification import Notification, NotificationType
from app.schemas.demand import QuoteCreate, QuoteResponse

router = APIRouter()


def _quote_response(q: Quote) -> dict:
    return {
        "id": q.id, "demand_id": q.demand_id, "artisan_id": q.artisan_id,
        "prix_estime": q.prix_estime, "delai_jours": q.delai_jours,
        "message": q.message, "status": q.status.value,
        "created_at": q.created_at,
        "artisan_name": q.artisan.full_name if q.artisan else None,
        "artisan_rating": q.artisan.artisan_profile.rating_avg if q.artisan and q.artisan.artisan_profile else None,
        "artisan_avatar": q.artisan.avatar_url if q.artisan else None,
    }


@router.post("/demands/{demand_id}/quotes", response_model=QuoteResponse, tags=["Quotes"])
def submit_quote(demand_id: int, data: QuoteCreate, db: Session = Depends(get_db), current_user: User = Depends(require_artisan)):
    demand = db.query(Demand).filter(Demand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    if demand.status != DemandStatus.ouverte:
        raise HTTPException(status_code=400, detail="Cette demande n'est plus ouverte")
    existing = db.query(Quote).filter(Quote.demand_id == demand_id, Quote.artisan_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà soumis un devis")

    quote = Quote(
        demand_id=demand_id, artisan_id=current_user.id,
        prix_estime=data.prix_estime, delai_jours=data.delai_jours, message=data.message,
    )
    db.add(quote)

    # Notify client
    db.add(Notification(
        user_id=demand.client_id, type=NotificationType.nouveau_devis,
        content=f"Nouveau devis de {current_user.full_name} pour '{demand.title}'",
        related_id=demand_id,
    ))

    if demand.status == DemandStatus.ouverte:
        demand.status = DemandStatus.en_attente

    db.commit()
    db.refresh(quote)
    return _quote_response(quote)


@router.get("/demands/{demand_id}/quotes", response_model=list[QuoteResponse], tags=["Quotes"])
def get_demand_quotes(demand_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quotes = db.query(Quote).filter(Quote.demand_id == demand_id).order_by(Quote.created_at.desc()).all()
    return [_quote_response(q) for q in quotes]


@router.put("/{quote_id}/accept", response_model=QuoteResponse)
def accept_quote(quote_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_client)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Devis introuvable")
    demand = db.query(Demand).filter(Demand.id == quote.demand_id).first()
    if demand.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Non autorisé")

    quote.status = QuoteStatus.accepte
    demand.status = DemandStatus.acceptee

    # Reject other quotes
    db.query(Quote).filter(
        Quote.demand_id == quote.demand_id, Quote.id != quote_id
    ).update({"status": QuoteStatus.refuse})

    # Create project
    project = Project(
        demand_id=demand.id, quote_id=quote.id,
        artisan_id=quote.artisan_id, client_id=current_user.id,
    )
    db.add(project)

    # Notify artisan
    db.add(Notification(
        user_id=quote.artisan_id, type=NotificationType.acceptation,
        content=f"Votre devis pour '{demand.title}' a été accepté !",
        related_id=demand.id,
    ))

    db.commit()
    db.refresh(quote)
    return _quote_response(quote)


@router.put("/{quote_id}/refuse", response_model=QuoteResponse)
def refuse_quote(quote_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_client)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Devis introuvable")
    demand = db.query(Demand).filter(Demand.id == quote.demand_id).first()
    if demand.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Non autorisé")

    quote.status = QuoteStatus.refuse

    db.add(Notification(
        user_id=quote.artisan_id, type=NotificationType.refus,
        content=f"Votre devis pour '{demand.title}' a été refusé.",
        related_id=demand.id,
    ))

    db.commit()
    db.refresh(quote)
    return _quote_response(quote)
