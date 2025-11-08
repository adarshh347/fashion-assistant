from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from ..services.fashion_agent import FashionAgent

class ChatRequest (BaseModel):
	session_id: str=Field (..., description="Unique id for the conversation")
	message: str = Field(..., description="User's Message")

class ChatResponse (BaseModel):
	session_id: str
	answer:str

router = APIRouter()

agent_singleton= FashionAgent()

def get_agent() -> FashionAgent:
	return agent_singleton

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
		request: ChatRequest,
		agent: FashionAgent = Depends(get_agent)
):

	answer, metadata = await agent.respond(
		session_id=request.session_id,
		message=request.message
	)
	return ChatResponse(
		session_id=metadata.get("session_id", request.session_id),
		answer=answer
	)

