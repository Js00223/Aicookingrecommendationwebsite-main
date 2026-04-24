import os
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 개발 단계에선 전체 허용, 배포 시 도메인 제한
    allow_methods=["*"],
    allow_headers=["*"],
)

# 클라이언트 초기화
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

class RecipeRequest(BaseModel):
    ingredients: List[str]
    user_id: str

@app.post("/api/ai/recommend")
async def recommend_recipe(request: RecipeRequest):
    try:
        # 1. Gemini에게 레시피 요청
        prompt = f"{', '.join(request.ingredients)}를 주재료로 한 요리 레시피 1개를 추천해줘. 요리명, 필요한 추가 재료, 상세 조리 순서를 JSON 구조로 출력해줘."
        response = model.generate_content(prompt)
        
        # 2. 결과를 Supabase DB에 저장 (History 관리)
        recipe_data = {
            "user_id": request.user_id,
            "ingredients": request.ingredients,
            "recipe_content": response.text
        }
        supabase.table("recipes").insert(recipe_data).execute()
        
        return {"recipe": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))