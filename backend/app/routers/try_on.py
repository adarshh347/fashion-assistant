from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response, JSONResponse
from typing import List
import base64
from ..services.virtual_try_on import VirtualTryOnService

router = APIRouter(
    prefix="/api/try-on",
    tags=["virtual-try-on"]
)

# Initialize service
try_on_service = VirtualTryOnService()

@router.post("/edit")
async def edit_garment(
    human_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    prompt: str = Form(...)
):
    """
    Perform virtual try-on using Pixazo AI.
    Takes a human image and a garment image, and a description.
    Returns the result image as PNG.
    """
    try:
        if not human_image.content_type.startswith('image/') or not garment_image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Both files must be images")
            
        human_bytes = await human_image.read()
        garment_bytes = await garment_image.read()
        
        result_image_bytes = await try_on_service.try_on(human_bytes, garment_bytes, prompt)
        
        return Response(content=result_image_bytes, media_type="image/png")
        
    except Exception as e:
        print(f"Error in edit_garment endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggestions")
async def get_suggestions(
    file: UploadFile = File(...)
):
    """
    Analyze the uploaded image and generate 4 creative try-on prompts.
    """
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
            
        image_bytes = await file.read()
        # Convert to base64 for the analyzer
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        suggestions = await try_on_service.generate_suggestions(image_base64)
        
        return JSONResponse(content={"suggestions": suggestions})
        
    except Exception as e:
        print(f"Error in get_suggestions endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
