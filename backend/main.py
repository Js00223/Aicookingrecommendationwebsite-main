import os
import json
import re
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# 환경변수 로드
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# Render 환경변수를 우선적으로 가져옴
GEMINI_KEY = os.environ.get("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")

app = FastAPI()

# 1. CORS 설정: 반드시 app = FastAPI() 바로 다음에 위치해야 합니다.
# allow_origins=["*"]를 사용할 때는 allow_credentials를 False로 해야 브라우저가 차단하지 않습니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

class RecipeRequest(BaseModel):
    ingredients: list[str]
    user_id: str

@app.post("/api/ai/recommend")
async def recommend_recipe(request: RecipeRequest):
    if not GEMINI_KEY:
        # 이 에러가 나면 Render 대시보드 Environment에 GEMINI_API_KEY가 있는지 확인하세요.
        raise HTTPException(status_code=500, detail="서버에 API 키 설정이 없습니다.")

    # 모델명 수정: gemini-1.5-flash가 현재 가장 표준입니다.
    model_candidates = ["gemini-2.5-flash", "gemini-2.5-pro"]
    last_error = ""

    # genai 설정
    genai.configure(api_key=GEMINI_KEY)
    
    for model_name in model_candidates:
        try:
            print(f"🔄 시도 중인 모델명: {model_name}")
            model = genai.GenerativeModel(model_name)
            
            ingredients_str = ", ".join(request.ingredients)
            prompt = (
                f"재료: {ingredients_str}. 이 재료로 만드는 요리 1개를 추천해줘.\n"
                "반드시 아래 JSON 형식으로만 응답해:\n"
                "{\"title\": \"요리명\", \"ingredients\": [\"재료\"], \"instructions\": [\"순서\"]}"
            )
            
            response = model.generate_content(prompt)

            if response and response.text:
                raw_text = response.text.strip()
                # 마크다운 태그(```json)가 포함될 경우를 대비한 정규식 추출
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
            continue

    raise HTTPException(status_code=500, detail=f"모든 모델 호출 실패: {last_error}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
