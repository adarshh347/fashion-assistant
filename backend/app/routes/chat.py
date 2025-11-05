from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.fashion_agent import FashionAgent


class ChatRequest(BaseModel):
	session_id: str
	message: str
	user_profile: dict | None = None


class ChatResponse(BaseModel):
	answer: str
	context: dict | None = None


router = APIRouter(prefix="/chat", tags=["chat"])
agent = FashionAgent()


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
	try:
		answer, context = await agent.respond(
			session_id=req.session_id,
			message=req.message,
			user_profile=req.user_profile or {},
		)
		return ChatResponse(answer=answer, context=context)
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))

