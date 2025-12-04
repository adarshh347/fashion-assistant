import os
import io
import base64
import httpx
import json
from typing import List, Optional, Dict, Any
from PIL import Image
from .garment_analyzer import GarmentAnalyzer
from ..utils.langchain_groq import get_groq_chat_llm
from langchain_core.messages import HumanMessage

class VirtualTryOnService:
    def __init__(self):
        print("🎨 Initializing VirtualTryOnService (Pixazo)...")
        # Initialize Pixazo API Key
        self.api_key = os.environ.get("PRIMARY_KEY")
        if not self.api_key:
            print("⚠️ WARNING: PRIMARY_KEY not found in environment variables. Virtual Try-On will fail.")
            
        # Initialize GarmentAnalyzer for understanding the image
        self.garment_analyzer = GarmentAnalyzer()
        
        # Initialize Text LLM for generating suggestions
        self.text_llm = get_groq_chat_llm(
            model_name="llama-3.3-70b-versatile",
            temperature=0.8
        )
        print("✅ VirtualTryOnService ready")

    async def _upload_temp_image(self, image_bytes: bytes) -> str:
        """
        Uploads image to tmpfiles.org to get a temporary public URL.
        """
        url = "https://tmpfiles.org/api/v1/upload"
        try:
            async with httpx.AsyncClient() as client:
                files = {'file': ('image.png', image_bytes, 'image/png')}
                response = await client.post(url, files=files)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('status') == 'success':
                        # Convert to direct download URL
                        # Original: https://tmpfiles.org/12345/image.png
                        # Direct:   https://tmpfiles.org/dl/12345/image.png
                        page_url = data['data']['url']
                        direct_url = page_url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
                        return direct_url
                
                print(f"⚠️ Failed to upload to tmpfiles.org: {response.text}")
                raise Exception("Failed to upload temporary image")
        except Exception as e:
            print(f"❌ Error uploading temp image: {str(e)}")
            raise e

    async def try_on(self, human_image_bytes: bytes, garment_image_bytes: bytes, description: str, category: str = "upper_body") -> bytes:
        """
        Perform Virtual Try-On using Pixazo AI.
        """
        try:
            print(f"🎨 Starting Virtual Try-On with description: {description}")
            
            # 1. Upload images to get public URLs
            print("📤 Uploading images to temporary storage...")
            human_url = await self._upload_temp_image(human_image_bytes)
            garm_url = await self._upload_temp_image(garment_image_bytes)
            print(f"✅ Images uploaded: Human={human_url}, Garment={garm_url}")
            
            # 2. Prepare Pixazo API request
            url = "https://gateway.pixazo.ai/virtual-tryon/v1/r-vton"
            
            headers = {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
                # Note: If Pixazo requires auth in header, uncomment below. 
                # Based on user sample, it might not, or it might be implicit.
                # Adding it just in case if standard Bearer auth is used.
            }
            if self.api_key:
                 headers['Authorization'] = f'Bearer {self.api_key}'

            data = {
                "category": category,
                "garm_img": garm_url,
                "human_img": human_url,
                "crop": True,
                "seed": 40,
                "steps": 30,
                "force_dc": False,
                "mask_only": False,
                "garment_des": description
            }
            
            print("🚀 Calling Pixazo API...")
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, headers=headers, json=data)
                
                if response.status_code != 200:
                    print(f"❌ Pixazo API Error: {response.status_code} - {response.text}")
                    raise Exception(f"Pixazo API failed: {response.text}")
                
                # 3. Parse Response
                result = response.json()
                print(f"✅ Pixazo Response received: {result}")
                
                # Extract output URL
                output_url = None
                if isinstance(result, dict):
                    # Check common keys
                    for key in ['output', 'image', 'url', 'result']:
                        if key in result and result[key]:
                            output_url = result[key]
                            break
                elif isinstance(result, list) and result:
                    output_url = result[0]
                
                if not output_url:
                    # Fallback: check if the response itself is a URL string
                    if isinstance(result, str) and result.startswith('http'):
                        output_url = result
                    else:
                        raise Exception(f"Could not find output URL in response: {result}")

                # 4. Download Result Image
                print(f"⬇️ Downloading result from {output_url}...")
                image_response = await client.get(output_url)
                if image_response.status_code == 200:
                    return image_response.content
                else:
                    raise Exception(f"Failed to download result image: {image_response.status_code}")

        except Exception as e:
            print(f"❌ Error in try_on: {str(e)}")
            raise e

    async def generate_suggestions(self, image_data_base64: str) -> List[str]:
        """
        Analyze the image and generate creative try-on prompts.
        """
        try:
            print("🤔 Generating try-on suggestions...")
            
            # 1. Analyze the current garment using the existing analyzer
            analysis = await self.garment_analyzer.analyze(image_data_base64, session_id="suggestion-gen")
            
            # 2. Generate creative transformation prompts based on the analysis
            current_desc = f"{analysis.colors[0]} {analysis.style_aesthetic[0]} {analysis.category}"
            
            prompt = f"""You are a creative fashion stylist. A user has uploaded a photo of a garment described as: "{current_desc}".
            
            Generate 4 distinct, creative, and specific descriptions for this garment that could be used in a virtual try-on prompt.
            Focus on describing the garment itself (color, material, style).
            
            Examples:
            - "A flowy red silk evening gown with spaghetti straps"
            - "A vintage blue denim jacket with patches"
            - "A professional white linen blazer"
            - "A casual oversized beige hoodie"
            
            Return ONLY a raw list of 4 prompts, separated by newlines. No numbering, no bullets."""
            
            response = await self.text_llm.ainvoke([HumanMessage(content=prompt)])
            suggestions = [s.strip() for s in response.content.split('\n') if s.strip()]
            
            # Ensure we have at least 4 suggestions
            return suggestions[:4]
            
        except Exception as e:
            print(f"❌ Error generating suggestions: {str(e)}")
            # Fallback suggestions
            return [
                "A stylish black cocktail dress",
                "A casual blue denim jacket",
                "A professional white shirt",
                "A cozy beige sweater"
            ]
