from typing import Optional, List
from langchain_core.messages import HumanMessage
from ..utils.langchain_groq import get_groq_chat_llm
from ..models import GarmentAnalysis
from pydantic import BaseModel, Field

class HybridRecommendation(BaseModel):
    """Hybrid recommendation combining two garments"""
    combined_style: str = Field(..., description="Combined style description")
    best_features_garment1: List[str] = Field(..., description="Best features from garment 1")
    best_features_garment2: List[str] = Field(..., description="Best features from garment 2")
    hybrid_suggestions: List[str] = Field(..., description="Suggestions for combining both styles")
    recommended_search_terms: List[str] = Field(..., description="Search terms to find similar hybrid styles online")
    style_score: int = Field(..., ge=0, le=100, description="How well these styles complement each other")

class GarmentAnalyzer:
    
    
    def __init__(self):
        print("🎨 Initializing GarmentAnalyzer...")
        # Use vision model for image analysis
        self.vision_llm = get_groq_chat_llm(
            model_name="meta-llama/llama-4-maverick-17b-128e-instruct", 
            temperature=0.3  # Lower temperature for more consistent structured output
        )
        # Text model for hybrid recommendations
        self.text_llm = get_groq_chat_llm(
            model_name="openai/gpt-oss-120b",
            temperature=0.7
        )
        # Create structured output version
        self.structured_llm = self.vision_llm.with_structured_output(GarmentAnalysis)
        self.hybrid_llm = self.text_llm.with_structured_output(HybridRecommendation)
        print("✅ GarmentAnalyzer ready (using meta-llama/llama-4-maverick-17b-128e-instruct)\n")
    
    async def analyze(self, image_data: str, session_id: str = "default") -> GarmentAnalysis:
        """
        Analyze a garment image and return structured insights.
        
        Args:
            image_data: Base64 encoded image
            session_id: Optional session identifier for context
            
        Returns:
            GarmentAnalysis object with detailed fashion insights
        """
        print(f"🔍 Starting garment analysis...")
        
        # Create analysis prompt
        analysis_prompt = """You are an expert fashion analyst with deep knowledge of:
- Garment categories, types, and construction
- Fashion aesthetics and style movements
- Cultural and regional fashion influences
- Color theory and pattern recognition
- Body shape and fit optimization

Analyze this garment image in detail. Provide:

1. **Category & Type**: Identify the main category (Tops/Bottoms/Outerwear/Dress/Accessories) and specific type (e.g., 'Denim Jacket', 'Pleated Skirt').
2. **Style Aesthetic**: List 3-5 style aesthetics. IMPORTANT: Format each as "Aspect: Detailed Description". Example: "Minimalist: Clean lines with lack of ornamentation focusing on form."
3. **Cultural Elements**: Note any cultural or regional influences (if none, return empty list).
4. **Vibe/Mood**: Describe 3-5 distinct moods or vibes. Be descriptive (e.g., "Effortlessly Chic", "Urban Industrial", "Romantic & Soft").
5. **Colors**: List the dominant and accent colors with descriptive names (e.g., "Midnight Blue", "Burnt Orange", "Sage Green").
6. **Patterns**: Identify patterns (Solid, Striped, Floral, etc.).
7. **Preference Score**: Rate 0-100 based on versatility, trend relevance, and styling potential.
8. **Body Shape Tips**: Provide 3-5 tips on how this garment flatters different body shapes.
9. **Styling Suggestions**: Give 3-5 concrete styling ideas.

Be specific, detailed, and fashion-forward in your analysis."""

        # Construct vision message
        message = HumanMessage(content=[
            {"type": "text", "text": analysis_prompt},
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}
            }
        ])
        
        try:
            print("📤 Sending to vision model for structured analysis...")
            analysis: GarmentAnalysis = await self.structured_llm.ainvoke([message])
            
            print(f"✅ Analysis received:")
            print(f"   - Category: {analysis.category} / {analysis.type}")
            print(f"   - Aesthetics: {', '.join(analysis.style_aesthetic)}")
            print(f"   - Score: {analysis.preference_score}/100")
            
            return analysis
            
        except Exception as e:
            import traceback
            print(f"❌ Error during analysis: {str(e)}")
            traceback.print_exc()
            # Return a fallback analysis
            print("🔄 Returning fallback analysis...")
            return GarmentAnalysis(
                category="Unknown",
                type="Unable to analyze",
                style_aesthetic=["Contemporary"],
                cultural_elements=[],
                vibe_mood=["Casual"],
                colors=["Various"],
                patterns=["Unknown"],
                preference_score=50,
                body_shape_tips=[
                    "Unable to analyze image",
                    "Please try uploading a clearer photo",
                    "Ensure good lighting and full garment visibility"
                ],
                styling_suggestions=[
                    "Upload a clearer image for detailed styling advice",
                    "Try different angles for better analysis"
                ]
            )
    
    async def generate_hybrid_recommendation(
        self, 
        analysis1: GarmentAnalysis, 
        analysis2: GarmentAnalysis
    ) -> HybridRecommendation:
        """
        Generate a hybrid recommendation by combining insights from two garment analyses.
        
        Args:
            analysis1: First garment analysis
            analysis2: Second garment analysis
            
        Returns:
            HybridRecommendation with combined insights and search terms
        """
        print("🔮 Generating hybrid recommendation...")
        
        prompt = f"""You are a creative fashion stylist. Two garments have been analyzed:

**Garment 1:**
- Category: {analysis1.category} - {analysis1.type}
- Style: {', '.join(analysis1.style_aesthetic)}
- Colors: {', '.join(analysis1.colors)}
- Vibe: {', '.join(analysis1.vibe_mood)}
- Score: {analysis1.preference_score}/100

**Garment 2:**
- Category: {analysis2.category} - {analysis2.type}
- Style: {', '.join(analysis2.style_aesthetic)}
- Colors: {', '.join(analysis2.colors)}
- Vibe: {', '.join(analysis2.vibe_mood)}
- Score: {analysis2.preference_score}/100

Create a hybrid style recommendation that:
1. Describes how these two styles could be combined
2. Lists the best features from each garment
3. Provides creative suggestions for mixing these styles
4. Generates 3-5 search terms to find similar hybrid pieces online (e.g., "minimalist streetwear jacket", "bohemian formal dress")
5. Rates how well these styles complement each other (0-100)

Be creative and fashion-forward!"""

        try:
            recommendation: HybridRecommendation = await self.hybrid_llm.ainvoke([
                HumanMessage(content=prompt)
            ])
            
            print(f"✅ Hybrid recommendation generated:")
            print(f"   - Style: {recommendation.combined_style[:50]}...")
            print(f"   - Compatibility: {recommendation.style_score}/100")
            print(f"   - Search terms: {', '.join(recommendation.recommended_search_terms)}")
            
            return recommendation
            
        except Exception as e:
            print(f"❌ Error generating hybrid: {str(e)}")
            return HybridRecommendation(
                combined_style="Unable to generate hybrid recommendation",
                best_features_garment1=["Analysis pending"],
                best_features_garment2=["Analysis pending"],
                hybrid_suggestions=["Please try again"],
                recommended_search_terms=["fashion", "style"],
                style_score=50
            )
