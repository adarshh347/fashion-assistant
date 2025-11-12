from typing import List, Optional
from pydantic import BaseModel,Field

class UserProfile(BaseModel):
    # the llm will be forced to output strictly matching the given structure
    name: Optional[str] = Field(None, description="The user's name if mentioned")
    style_keywords: List[str] = Field(
        default_factory=list,
        description="Keywords describing their style (e.g., 'boho', 'minimalist', 'grunge')"
    )
    clothing_types_liked: List[str] = Field(
        default_factory=list,
        description="Specific items they like (e.g., 'bomber jackets', 'skinny jeans')."
    )
    colors: List[str] = Field(
        default_factory=list,
        description="Colors the user has mentioned liking."
    )
    budget_tier: Optional[str] = Field(
        None,
        description="Budget preference: 'budget', 'mid-range', or 'luxury'."
    )

