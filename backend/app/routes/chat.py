from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import base64
from ..services.fashion_agent import FashionAgent
from ..services.garment_analyzer import GarmentAnalyzer

class ChatResponse(BaseModel):
    session_id: str
    answer: str
    model_used: str

class AnalysisResponse(BaseModel):
    category: str
    type: str
    style_aesthetic: list[str]
    cultural_elements: list[str]
    vibe_mood: list[str]
    colors: list[str]
    patterns: list[str]
    preference_score: int
    body_shape_tips: list[str]
    styling_suggestions: list[str]
    image_data: str  # base64 encoded image for gallery

router = APIRouter()

agent_singleton = FashionAgent()
analyzer_singleton = GarmentAnalyzer()

def get_agent() -> FashionAgent:
    return agent_singleton

def get_analyzer() -> GarmentAnalyzer:
    return analyzer_singleton

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    session_id: str = Form(...),
    message: str = Form(...),
    image: Optional[UploadFile] = File(None),
    agent: FashionAgent = Depends(get_agent)
):
    """
    Main chat endpoint that handles both text and image inputs.
    - If image is provided: Uses Llama Vision model (llama-3.2-90b-vision-preview)
    - If text only: Uses GPT OSS equivalent (llama-3.3-70b-versatile)
    """
    try:
        image_data = None
        model_used = "GPT OSS"
        
        if image:
            print(f"📸 Image received: {image.filename}, content_type: {image.content_type}")
            contents = await image.read()
            image_data = base64.b64encode(contents).decode("utf-8")
            model_used = "Llama 4 Maverik"
            print(f"✅ Image encoded, size: {len(image_data)} chars")

        print(f"💬 Message: {message[:100]}...")
        print(f"🤖 Using model: {model_used}")

        answer, metadata = await agent.respond(
            session_id=session_id,
            message=message,
            image_data=image_data
        )

        print(f"✅ Response generated: {answer[:100]}...")

        return ChatResponse(
            session_id=metadata.get("session_id", session_id),
            answer=answer,
            model_used=model_used
        )
    
    except Exception as e:
        print(f"❌ Error in chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@router.post("/analyze-garment", response_model=AnalysisResponse)
async def analyze_garment(
    image: UploadFile = File(...),
    session_id: str = Form(default="default-session"),
    analyzer: GarmentAnalyzer = Depends(get_analyzer)
):
    """
    StyleScan endpoint - Analyzes a garment image and returns structured data.
    Uses vision model to extract detailed fashion insights.
    """
    try:
        print(f"\n{'='*60}")
        print(f"🔍 StyleScan Analysis Request")
        print(f"📸 Image: {image.filename}, type: {image.content_type}")
        
        # Read and encode image
        contents = await image.read()
        image_data = base64.b64encode(contents).decode("utf-8")
        print(f"✅ Image encoded: {len(image_data)} chars")
        
        # Perform analysis
        analysis = await analyzer.analyze(image_data, session_id)
        
        print(f"✅ Analysis complete:")
        print(f"   Category: {analysis.category}")
        print(f"   Type: {analysis.type}")
        print(f"   Score: {analysis.preference_score}/100")
        print(f"{'='*60}\n")
        
        # Return analysis with image data for gallery
        return AnalysisResponse(
            category=analysis.category,
            type=analysis.type,
            style_aesthetic=analysis.style_aesthetic,
            cultural_elements=analysis.cultural_elements,
            vibe_mood=analysis.vibe_mood,
            colors=analysis.colors,
            patterns=analysis.patterns,
            preference_score=analysis.preference_score,
            body_shape_tips=analysis.body_shape_tips,
            styling_suggestions=analysis.styling_suggestions,
            image_data=image_data
        )
        
    except Exception as e:
        print(f"❌ Error in analyze endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

class CompareResponse(BaseModel):
    analysis1: AnalysisResponse
    analysis2: AnalysisResponse
    hybrid: dict

@router.post("/compare-garments", response_model=CompareResponse)
async def compare_garments(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    session_id: str = Form(default="compare-session"),
    analyzer: GarmentAnalyzer = Depends(get_analyzer)
):
    """
    Compare two garments and generate hybrid recommendations.
    Analyzes both images and creates a combined style suggestion.
    """
    try:
        print(f"\n{'='*60}")
        print(f"🔍 StyleScan COMPARE Request")
        print(f"📸 Image 1: {image1.filename}")
        print(f"📸 Image 2: {image2.filename}")
        
        # Process both images
        contents1 = await image1.read()
        image_data1 = base64.b64encode(contents1).decode("utf-8")
        
        contents2 = await image2.read()
        image_data2 = base64.b64encode(contents2).decode("utf-8")
        
        print(f"✅ Both images encoded")
        
        # Analyze both garments
        print("🔍 Analyzing garment 1...")
        analysis1 = await analyzer.analyze(image_data1, f"{session_id}-1")
        
        print("🔍 Analyzing garment 2...")
        analysis2 = await analyzer.analyze(image_data2, f"{session_id}-2")
        
        # Generate hybrid recommendation
        print("🔮 Generating hybrid recommendation...")
        hybrid = await analyzer.generate_hybrid_recommendation(analysis1, analysis2)
        
        print(f"✅ Compare analysis complete!")
        print(f"{'='*60}\n")
        
        return CompareResponse(
            analysis1=AnalysisResponse(
                category=analysis1.category,
                type=analysis1.type,
                style_aesthetic=analysis1.style_aesthetic,
                cultural_elements=analysis1.cultural_elements,
                vibe_mood=analysis1.vibe_mood,
                colors=analysis1.colors,
                patterns=analysis1.patterns,
                preference_score=analysis1.preference_score,
                body_shape_tips=analysis1.body_shape_tips,
                styling_suggestions=analysis1.styling_suggestions,
                image_data=image_data1
            ),
            analysis2=AnalysisResponse(
                category=analysis2.category,
                type=analysis2.type,
                style_aesthetic=analysis2.style_aesthetic,
                cultural_elements=analysis2.cultural_elements,
                vibe_mood=analysis2.vibe_mood,
                colors=analysis2.colors,
                patterns=analysis2.patterns,
                preference_score=analysis2.preference_score,
                body_shape_tips=analysis2.body_shape_tips,
                styling_suggestions=analysis2.styling_suggestions,
                image_data=image_data2
            ),
            hybrid={
                "combined_style": hybrid.combined_style,
                "best_features_garment1": hybrid.best_features_garment1,
                "best_features_garment2": hybrid.best_features_garment2,
                "hybrid_suggestions": hybrid.hybrid_suggestions,
                "recommended_search_terms": hybrid.recommended_search_terms,
                "style_score": hybrid.style_score
            }
        )
        
    except Exception as e:
        print(f"❌ Error in compare endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

@router.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {
        "status": "healthy",
        "models": {
            "text": "llama-3.3-70b-versatile (GPT OSS)",
            "vision": "llama-3.2-90b-vision-preview (Llama 4 Maverik)"
        }
    }
