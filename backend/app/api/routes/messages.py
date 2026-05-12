from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.message import Message
from app.models.project import Project
from app.schemas.demand import MessageCreate, MessageResponse
import json

router = APIRouter()

# WebSocket connections store
active_connections: dict[int, list[WebSocket]] = {}


def _msg_response(m: Message) -> dict:
    return {
        "id": m.id, "sender_id": m.sender_id, "receiver_id": m.receiver_id,
        "project_id": m.project_id, "content": m.content,
        "file_url": m.file_url, "is_read": m.is_read,
        "created_at": m.created_at,
        "sender_name": m.sender.full_name if m.sender else None,
    }


@router.get("/projects/{project_id}/messages", response_model=list[MessageResponse])
def get_messages(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    if project.client_id != current_user.id and project.artisan_id != current_user.id:
        raise HTTPException(status_code=403, detail="Non autorisé")
    # Mark as read
    db.query(Message).filter(
        Message.project_id == project_id, Message.receiver_id == current_user.id, Message.is_read == False
    ).update({"is_read": True})
    db.commit()
    msgs = db.query(Message).filter(Message.project_id == project_id).order_by(Message.created_at.asc()).all()
    return [_msg_response(m) for m in msgs]


@router.post("/projects/{project_id}/messages", response_model=MessageResponse)
def send_message(project_id: int, data: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    if project.client_id != current_user.id and project.artisan_id != current_user.id:
        raise HTTPException(status_code=403, detail="Non autorisé")
    receiver_id = project.artisan_id if current_user.id == project.client_id else project.client_id
    msg = Message(
        sender_id=current_user.id, receiver_id=receiver_id,
        project_id=project_id, content=data.content, file_url=data.file_url,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    # Broadcast via WebSocket
    _broadcast(project_id, _msg_response(msg))
    return _msg_response(msg)


def _broadcast(project_id: int, data: dict):
    if project_id in active_connections:
        for ws in active_connections[project_id]:
            try:
                import asyncio
                asyncio.create_task(ws.send_json(data))
            except Exception:
                pass


@router.websocket("/ws/{project_id}")
async def websocket_chat(websocket: WebSocket, project_id: int):
    await websocket.accept()
    if project_id not in active_connections:
        active_connections[project_id] = []
    active_connections[project_id].append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections[project_id].remove(websocket)
