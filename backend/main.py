import os
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

# 1. 환경 변수 경로 강제 지정
# 실행 중인 터미널의 현재 위치(cwd)와 main.py의 위치를 모두 뒤집니다.
current_dir = Path(os.getcwd())
env_path = current_dir / ".env"

if not env_path.exists():
    env_path = Path(__file__).parent / ".env"

load_dotenv(dotenv_path=env_path, override=True)

GEMINI_KEY = os.getenv("GEMINI_API_KEY")

# 🔍 [디버깅 로그] 서버가 켜질 때 키가 제대로 로드됐는지 터미널에 찍힙니다.
print("="*50)
print(f"📂 .env 경로 확인: {env_path.absolute()}")
if GEMINI_KEY:
    print(f"✅ GEMINI_API_KEY 로드 성공! (앞 4자리: {GEMINI_KEY[:4]}...)")
else:
    print("❌ GEMINI_API_KEY를 찾을 수 없습니다. .env 파일을 확인해주세요.")
print("="*50)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecipeRequest(BaseModel):
    ingredients: list[str]
    user_id: str

@app.post("/api/ai/recommend")
async def recommend_recipe(request: RecipeRequest):
    # 요청 올 때마다 환경변수 최신화 (실시간 반영용)
    load_dotenv(dotenv_path=env_path, override=True)
    current_key = os.getenv("GEMINI_API_KEY")

    if not current_key:
        raise HTTPException(status_code=500, detail="API 키가 설정되지 않았습니다.")

    try:
        # 클라이언트 생성 시 키를 명시적으로 전달
        ai_client = genai.Client(api_key=current_key)
        
        ingredients_str = ", ".join(request.ingredients)
        prompt = (
            f"주재료: {ingredients_str}. 이 재료들을 활용한 맛있는 요리 레시피 1개를 추천해줘. "
            "응답은 반드시 마크다운 없이 순수한 JSON 형식으로만 해줘. "
            "구조: { 'title': '', 'ingredients': [], 'instructions': [] }"
        )
        
        response = ai_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        
        raw_text = response.text.strip()
        # 마크다운 제거
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        
        return {
            "status": "success",
            "recipe": json.loads(raw_text.strip())
        }
        
    except Exception as e:
        # 에러 발생 시 터미널에 상세 에러 출력
        print(f"‼️ 상세 에러 로그: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)