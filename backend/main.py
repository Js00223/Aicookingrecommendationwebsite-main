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

# CORS 설정 (storbit 설정 반영)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 환경 변수 및 클라이언트 초기화
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

class RecipeRequest(BaseModel):
    ingredients: List[str]
    user_id: str

@app.post("/api/ai/recommend")
async def recommend_recipe(request: RecipeRequest):
    try:
        prompt = f"{', '.join(request.ingredients)} 재료를 활용한 요리 레시피를 추천해줘. 요리명, 재료 정보, 조리 순서를 JSON 형식을 포함해서 한국어로 설명해줘."
        response = model.generate_content(prompt)
        recipe_text = response.text

        # 결과를 Supabase recipes 테이블에 기록 (로깅 및 히스토리 관리)
        data = {
            "user_id": request.user_id,
            "ingredients": request.ingredients,
            "recipe_content": recipe_text
        }
        supabase.table("recipes").insert(data).execute()

        return {"status": "success", "recipe": recipe_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)