import os
import json
import re
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai  # 라이브러리 호출 방식 통일
from dotenv import load_dotenv

# 환경변수 로드
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# Render 환경변수 우선 사용, 없을 경우 .env 사용
GEMINI_KEY = os.environ.get("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")

app = FastAPI()

# CORS 설정: allow_credentials는 origins가 ["*"]일 때 제거하거나 False여야 함
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

class RecipeRequest(BaseModel):
    ingredients: list[str]
    user_id: str

@app.post("/api/ai/recommend")
async def recommend_recipe(request: RecipeRequest):
    if not GEMINI_KEY:
        raise HTTPException(status_code=500, detail="서버에 GEMINI_API_KEY 설정이 없습니다.")

    # 1. 모델명 수정: gemini-2.5-flash는 아직 존재하지 않습니다.
    # 현재 가장 안정적인 모델명인 gemini-1.5-flash를기본으로 사용합니다.
    model_candidates = ["gemini-2.5-flash", "gemini-2.5-pro"]
    last_error = ""

    # API 키 설정
    genai.configure(api_key=GEMINI_KEY)
    
    for model_name in model_candidates:
        try:
            print(f"🔄 시도 중인 모델명: {model_name}")
            
            # 모델 인스턴스 생성 (Google GenAI 신버전 SDK 방식)
            model = genai.GenerativeModel(model_name)
            
            ingredients_str = ", ".join(request.ingredients)
            prompt = (
                f"재료: {ingredients_str}. 이 재료로 만드는 요리 1개를 추천해줘.\n"
                "반드시 아래 JSON 형식으로만 응답해:\n"
                "{\"title\": \"요리명\", \"ingredients\": [\"재료\"], \"instructions\": [\"순서\"]}"
            )
            
            # 콘텐츠 생성
            response = model.generate_content(prompt)

            # 성공 시 데이터 처리
            if response and response.text:
                raw_text = response.text.strip()
                # JSON 추출 로직 (마크다운 ```json ... ``` 제거 대응)
                json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
                
                if json_match:
                    recipe_data = json.loads(json_match.group(0))
                else:
                    recipe_data = json.loads(raw_text)
                
                print(f"✅ {model_name} 호출 성공!")
                return {"status": "success", "recipe": recipe_data}

        except Exception as e:
            last_error = str(e)
            print(f"❌ {model_name} 실패: {last_error}")
            continue # 다음 모델명으로 시도

    # 모든 시도가 실패한 경우
    raise HTTPException(status_code=500, detail=f"모든 모델 호출 실패. 최종 에러: {last_error}")

if __name__ == "__main__":
    import uvicorn
    # host를 0.0.0.0으로 해야 외부(Render)에서 접속 가능합니다.
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
