from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage
from ..utils.langchain_groq import get_groq_chat_llm
import httpx
import os
import asyncio

class TaraRecommendationCategory(BaseModel):
    category_name: str = Field(..., description="Name of the category (e.g., Jewellery, Tops, Lower, Color Palette)")
    keywords: List[str] = Field(..., description="Few keywords describing the change/addition")
    description: str = Field(..., description="2-line description of the recommendation")

class TaraRecommendationOption(BaseModel):
    id: int = Field(..., description="Unique ID for the option (1-4)")
    summary_title: str = Field(..., description="Short title for this recommendation style")
    summary_description: str = Field(..., description="Summary of the recommendation")
    categories: List[TaraRecommendationCategory] = Field(..., description="Detailed recommendations for different categories")

class TaraResponse(BaseModel):
    options: List[TaraRecommendationOption] = Field(..., description="List of 4 different recommendation options")

class VisualSuggestion(BaseModel):
    image_url: str
    reasoning: str

class VisualSuggestionsResponse(BaseModel):
    suggestions: List[VisualSuggestion]

from dotenv import load_dotenv

class TaraStylistService:
    def __init__(self):
        print("🎨 Initializing TaraStylistService...")
        load_dotenv()
        # Vision model for analyzing the image
        self.vision_llm = get_groq_chat_llm(
            model_name="meta-llama/llama-4-maverick-17b-128e-instruct", 
            temperature=0.5
        )
        # Text model for generating structured recommendations
        self.text_llm = get_groq_chat_llm(
            model_name="openai/gpt-oss-120b",
            temperature=0.7
        )
        self.structured_llm = self.text_llm.with_structured_output(TaraResponse)
        self.unsplash_access_key = os.environ.get("UNSPLASH_ACCESS_KEY")
        
        if not self.unsplash_access_key:
            print("⚠️ WARNING: UNSPLASH_ACCESS_KEY not found in environment variables!")
        else:
            print(f"✅ Unsplash Key loaded (starts with: {self.unsplash_access_key[:4]}...)")
            
        print("✅ TaraStylistService ready")

    async def generate_recommendations(self, image_data: str, user_prompt: str) -> TaraResponse:
        print("🔍 Starting Tara analysis...")
        
        # Step 1: Analyze image with Vision LLM to get a description
        vision_prompt = "Describe this person's outfit in detail, including clothing, accessories, colors, and overall style."
        message = HumanMessage(content=[
            {"type": "text", "text": vision_prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}
        ])
        
        try:
            print("📤 Sending to vision model...")
            vision_response = await self.vision_llm.ainvoke([message])
            current_look_description = vision_response.content
            print("✅ Vision analysis complete")
            
            # Step 2: Generate recommendations
            generation_prompt = f"""
            You are Tara, an expert AI stylist.
            
            Current Look Description:
            {current_look_description}
            
            User's Request:
            "{user_prompt}"
            
            Based on the current look and the user's request, generate 4 DISTINCT and UNIQUE recommendation options.
            
            For each option, provide:
            1. A summary title and description.
            2. Detailed recommendations for the following categories:
               - Jewelleries: What changes or additions?
               - Tops: What changes or additions?
               - Lower: What changes or additions?
               - Color Palettes: Suggested colors.
               - 2-3 other relevant categories (e.g., Shoes, Accessories, Hairstyle, Makeup) - Choose yourself based on the style.
               
            Ensure the recommendations are actionable, creative, and strictly align with the user's request.
            """
            
            print("🔮 Generating structured recommendations...")
            response = await self.structured_llm.ainvoke(generation_prompt)
            print("✅ Recommendations generated")
            return response
            
        except Exception as e:
            print(f"❌ Error in Tara service: {str(e)}")
            # Return empty/error response if needed, or let it bubble up
            raise e

    async def get_visual_suggestions(self, original_image_data: str, category: str, keywords: List[str], description: str) -> VisualSuggestionsResponse:
        print(f"🖼️ Fetching visual suggestions for {category}...")
        
        # 1. Search Unsplash
        query = f"{' '.join(keywords)} {category} fashion"
        print(f"🔍 Searching Unsplash for: {query}")
        
        unsplash_url = "https://api.unsplash.com/search/photos"
        headers = {"Authorization": f"Client-ID {self.unsplash_access_key}"}
        params = {"query": query, "per_page": 3, "orientation": "portrait"}
        
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(unsplash_url, headers=headers, params=params)
                resp.raise_for_status()
                data = resp.json()
                
            image_results = data.get("results", [])
            suggestions = []
            
            # 2. Analyze each image with Vision LLM
            for img in image_results:
                img_url = img["urls"]["regular"]
                
                # Construct prompt for Vision LLM
                reasoning_prompt = f"""
                You are an expert stylist.
                
                Context:
                The user wants to update their look with: {description}
                Category: {category}
                
                Task:
                Look at the suggested item in the second image. Explain briefly (1-2 sentences) why this specific visual suggestion suits the user's goal and complements the style described.
                """
                
                # We send the suggested image URL to the vision model
                # Note: Sending two images (original + suggested) might be too heavy or not supported by all models in one go depending on the API.
                # For efficiency and reliability with the current model setup, we will focus on analyzing the suggested image 
                # in the context of the description provided.
                
                message = HumanMessage(content=[
                    {"type": "text", "text": reasoning_prompt},
                    {"type": "image_url", "image_url": {"url": img_url}}
                ])
                
                print(f"🧠 Analyzing suitability for image...")
                llm_response = await self.vision_llm.ainvoke([message])
                reasoning = llm_response.content
                
                suggestions.append(VisualSuggestion(
                    image_url=img_url,
                    reasoning=reasoning
                ))
                
            return VisualSuggestionsResponse(suggestions=suggestions)
            
        except Exception as e:
            print(f"❌ Error fetching visual suggestions: {str(e)}")
            # Return empty list on error to avoid breaking UI
            return VisualSuggestionsResponse(suggestions=[])
