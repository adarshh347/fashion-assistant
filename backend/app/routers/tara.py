from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from ..services.tara_stylist import TaraStylistService, TaraResponse, VisualSuggestionsResponse

router = APIRouter(prefix="/api/tara", tags=["Tara Stylist"])
tara_service = TaraStylistService()

class TaraRequest(BaseModel):
    image: str # Base64 encoded image
    prompt: str

class VisualizeRequest(BaseModel):
    original_image: str # Base64 encoded image
    category: str
    keywords: List[str]
    description: str

@router.post("/analyze", response_model=TaraResponse)
async def analyze_style(request: TaraRequest):
    try:
        # Remove header if present (data:image/jpeg;base64,)
        if "," in request.image:
            image_data = request.image.split(",")[1]
        else:
            image_data = request.image
            
        return await tara_service.generate_recommendations(image_data, request.prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/visualize", response_model=VisualSuggestionsResponse)
async def visualize_category(request: VisualizeRequest):
    try:
        # Remove header if present (data:image/jpeg;base64,)
        if "," in request.original_image:
            image_data = request.original_image.split(",")[1]
        else:
            image_data = request.original_image
            
        return await tara_service.get_visual_suggestions(
            image_data, 
            request.category, 
            request.keywords, 
            request.description
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
