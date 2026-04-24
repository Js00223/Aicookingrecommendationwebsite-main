import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai  # 신형 SDK
from supabase import create_client, Client
from dotenv import load_dotenv

# .env 파일 로드 확인용 (경로가 다를 수 있으므로 명시적 지정 권장)
load_dotenv() 

app = FastAPI()

# 디버깅용: 환경변수가 잘 로드되었는지 확인
if not os.getenv("SUPABASE_URL"):
    print("❌ 에러: SUPABASE_URL을 찾을 수 없습니다. .env 파일을 확인하세요!")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 클라이언트 초기화
supabase: Client = create_client(
    os.getenv("SUPABASE_URL") or "", 
    os.getenv("SUPABASE_SERVICE_ROLE_KEY") or ""
)

# 신형 Gemini 클라이언트 설정
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class RecipeRequest(BaseModel):
    ingredients: list[str]
    user_id: str

@app.post("/api/ai/recommend")
async def recommend_recipe(request: RecipeRequest):
    try:
        prompt = f"{', '.join(request.ingredients)}를 주재료로 한 요리 레시피 1개를 추천해줘. JSON 형식으로 요리명, 재료, 순서를 알려줘."
        
        # 신형 SDK 호출 방식
        response = client.models.generate_content(
            model="gemini-2.0-flash", # 최신 모델 사용 권장
            contents=prompt
        )
        
        # DB 저장 및 반환 로직...
        return {"recipe": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))