from pydantic import BaseModel, Field
from typing import Optional, List

class UserProfile(BaseModel):
    name: Optional[str] = Field(None, description="User's name")
    budget_tier: Optional[str] = Field(None, description="Budget tier: low, medium, high")
    style_keywords: Optional[List[str]] = Field(default_factory=list, description="Style keywords")
    clothing_types_liked: Optional[List[str]] = Field(default_factory=list, description="Clothing types liked")
    colors: Optional[List[str]] = Field(default_factory=list, description="Preferred colors")

class GarmentAnalysis(BaseModel):
    """Structured output for garment analysis"""
    category: str = Field(..., description="Main garment category (e.g., 'Tops', 'Bottoms', 'Outerwear', 'Dress')")
    type: str = Field(..., description="Specific type (e.g., 'T-shirt', 'Jeans', 'Blazer')")
    style_aesthetic: List[str] = Field(..., description="Style aesthetics (e.g., 'Casual', 'Formal', 'Streetwear', 'Minimalist')")
    cultural_elements: List[str] = Field(default_factory=list, description="Cultural or regional influences")
    vibe_mood: List[str] = Field(..., description="Vibe/mood keywords (e.g., 'Relaxed', 'Professional', 'Edgy')")
    colors: List[str] = Field(..., description="Dominant colors in the garment")
    patterns: List[str] = Field(default_factory=list, description="Patterns if any (e.g., 'Striped', 'Floral', 'Solid')")
    preference_score: int = Field(..., ge=0, le=100, description="Match score with user preferences (0-100)")
    body_shape_tips: List[str] = Field(..., description="Body shape enhancement tips")
    styling_suggestions: List[str] = Field(..., description="How to style this garment")
