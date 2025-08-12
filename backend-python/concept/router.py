import datetime
import json
import re
import os
import numpy as np
from dotenv import load_dotenv
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import pandas as pd
from langchain_community.vectorstores import FAISS
from faker import Faker

# --- 초기 설정 ---
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY 환경 변수를 찾을 수 없습니다. .env 파일을 확인해주세요.")
os.environ["OPENAI_API_KEY"] = api_key
fake = Faker()

router = APIRouter(
    prefix="/api/plans",
    tags=["Concept API"]
)

FAISS_INDEX_PATH = "faiss_boardgame_index"
RAG_DATA_PATH = "./boardgame_detaildata_1-101.json"

def setup_rag_retriever():
    """
    서버 시작 시 RAG 검색기(Retriever)를 설정하는 함수입니다.
    """
    try:
        embeddings = OpenAIEmbeddings()
        if os.path.exists(FAISS_INDEX_PATH):
            print(f"'{FAISS_INDEX_PATH}'에서 기존 FAISS 인덱스를 로드합니다.")
            vectorstore = FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
            return vectorstore.as_retriever(search_kwargs={"k": 5})

        print(f"'{FAISS_INDEX_PATH}'를 찾을 수 없습니다. '{RAG_DATA_PATH}'에서 새 인덱스를 생성합니다.")
        df = pd.read_json(RAG_DATA_PATH)
        if df.empty:
            print("Warning: RAG 데이터 파일이 비어있습니다.")
            return None

        df_processed = df[['게임ID', '이름', '설명', '최소인원', '최대인원', '난이도', '카테고리', '메커니즘']].copy()
        df_processed.rename(columns={'카테고리': '테마', '최소인원': 'min_players', '최대인원': 'max_players', '난이도': 'difficulty_weight', '메커니즘': 'mechanics_list'}, inplace=True)
        for col in ['테마', 'mechanics_list', '설명']:
            df_processed[col] = df_processed[col].fillna('')

        documents = [
            (f"게임 이름: {row['이름']}\n설명: {row['설명']}\n테마: {row['테마']}\n"
             f"플레이 인원: {row['min_players']}~{row['max_players']}명\n난이도: {row.get('difficulty_weight', 0.0):.2f}\n"
             f"메커니즘: {row['mechanics_list']}")
            for index, row in df_processed.iterrows()
        ]

        vectorstore = FAISS.from_texts(documents, embeddings)
        vectorstore.save_local(FAISS_INDEX_PATH)
        print(f"새로운 FAISS 인덱스를 생성하여 '{FAISS_INDEX_PATH}'에 저장했습니다.")

        return vectorstore.as_retriever(search_kwargs={"k": 5})

    except FileNotFoundError:
        print(f"Warning: RAG 데이터 파일 '{RAG_DATA_PATH}'를 찾을 수 없습니다. RAG 기능이 비활성화됩니다.")
        return None
    except Exception as e:
        print(f"Warning: RAG 설정 중 오류 발생. RAG 기능이 비활성화됩니다. 오류: {e}")
        return None

retriever = setup_rag_retriever()

llm = ChatOpenAI(model_name="gpt-4o", temperature=0.8)

generate_concept_prompt = PromptTemplate(
    input_variables=["theme", "playerCount", "averageWeight", "retrieved_games"],
    template=(
        "# Mission: 당신은 보드게임 업계의 전설적인 크리에이티브 디렉터, '컨셉 아키텍트'입니다. 당신의 임무는 플레이어의 마음에 각인될 독창적인 세계관과 경험을 설계하는 것입니다.\n\n"
        "## Creative Framework: The 'Golden Connection'\n"
        "훌륭한 게임은 테마, 메커니즘, 플레이어 경험이 하나의 황금 고리(Golden Connection)로 연결되어 있습니다. 당신의 사고 과정은 다음 단계를 따라야 합니다.\n"
        "1.  **[1단계: 영감 분석]** 주어진 영감(Inspirations)을 단순 참고하지 말고, 핵심적인 '재미의 본질'을 추출하세요. '이 게임은 왜 성공했을까?', '가장 독특한 메커니즘은 무엇인가?', '테마를 어떻게 살렸는가?'를 자문하며 분석해야 합니다.\n"
        "2.  **[2단계: 경험 목표 정의]** 플레이어가 이 게임을 통해 어떤 '감정'과 '경험'을 하길 원하나요? (예: '자원이 고갈되는 절박함 속에서 생존하는 희열', '치밀한 심리전 끝에 상대의 허를 찌르는 쾌감', '나만의 제국을 건설하며 느끼는 뿌듯함') 구체적인 경험 목표를 설정하세요.\n"
        "3.  **[3단계: 황금 고리 구축]** 설정한 '경험 목표'를 실현하기 위해, 입력된 '테마'와 가장 잘 어울리는 '핵심 메커니즘'을 결합하세요. 이 세 가지 요소(테마, 경험, 메커니즘)가 어떻게 서로를 강화시키는지 한 문장으로 정의해야 합니다. (예: '고대 유물' 테마에서, '경매' 메커니즘을 통해 '유물의 진정한 가치를 꿰뚫어 보는 고고학자의 경험'을 제공한다.) 이것이 당신이 만들 컨셉의 심장입니다.\n\n"
        "## Input Data Analysis:\n"
        "- User's Theme: {theme}\n"
        "- Player Count: {playerCount}\n"
        "- Target Difficulty: {averageWeight}\n"
        "- Inspirations from other games (Analyze, Don't Copy): \n{retrieved_games}\n\n"
        "## Output Language Requirement:\n"
        "- **All generated text for the JSON output MUST be in rich, compelling, and natural KOREAN.**\n\n"
        "## Final Output Instruction:\n"
        "이제 'Creative Framework'에 따라 깊이 있게 사고한 결과를 바탕으로, 아래 JSON 형식에 맞춰 최종 결과물만을 생성해주세요. **JSON 코드 블록 외에 다른 설명, 주석, 사고 과정은 절대 포함하지 마세요.**\n"
        "```json\n"
        "{{\n"
        '    "theme": "{theme}",\n'
        '    "playerCount": "{playerCount}",\n'
        '    "averageWeight": {averageWeight},\n'
        '    "ideaText": "[황금 고리를 바탕으로, 플레이어가 게임에서 경험할 핵심적인 재미와 최종 목표를 한 편의 영화 예고편처럼 흥미롭게 묘사하세요.]",\n'
        '    "mechanics": "[핵심 메커니즘을 2~3개 선정하여 명확히 설명하세요. 각 메커니즘이 왜 이 테마를 살리고, 당신이 정의한 경험 목표를 달성하는 데 필수적인지 그 연결고리를 구체적으로 서술하세요.]",\n'
        '    "storyline": "[플레이어를 단숨에 몰입시킬 매력적인 세계관과 그 속에서 플레이어가 맡게 될 역할을 부여하세요. 플레이가 왜 이 목표를 향해 나아가야 하는지에 대한 강력한 동기를 부여하는 스토리를 제시하세요.]"\n'
        "}}\n"
        "```"
    )
)
concept_generation_chain = LLMChain(llm=llm, prompt=generate_concept_prompt)

regenerate_concept_prompt = PromptTemplate(
    input_variables=["original_concept_json", "feedback"],
    template=(
        "# Mission: 당신은 침체된 게임 컨셉에 새로운 활력을 불어넣는 '컨셉 닥터'입니다. 날카로운 분석력으로 기존 컨셉의 장단점을 파악하고, 사용자의 피드백을 창의적으로 재해석하여 컨셉을 다음 단계로 진화시키세요.\n\n"
        "## Regeneration Framework: Diagnose & Prescribe\n"
        "1.  **[1단계: 컨셉 진단]** 원본 컨셉(Original Concept)을 정밀하게 분석하세요.\n"
        "    -   **Heart (심장):** 이 컨셉의 가장 매력적이고 유지해야 할 핵심 재미는 무엇인가?\n"
        "    -   **Pain Point (통점):** 사용자의 피드백이 지적하고 있거나, 혹은 당신이 발견한 구조적 약점은 무엇인가?\n"
        "2.  **[2단계: 피드백 재해석]** 사용자의 피드백(User's Feedback)의 표면적인 의미 너머에 있는 '근본적인 욕구'를 파악하세요. '너무 복잡하다'는 피드백은 '더 빠른 템포', '직관적인 선택지', '초보자를 위한 가이드' 등 다양한 해결책으로 이어질 수 있습니다.\n"
        "3.  **[3단계: 치료 계획 수립]** 'Heart'는 강화하고 'Pain Point'는 해결하면서, 피드백의 '근본적인 욕구'를 충족시킬 구체적인 '치료 계획'을 수립하세요. (예: '기존의 스파이 테마(Heart)는 유지하되, 복잡한 자원 관리(Pain Point)를 과감히 삭제하고, 사용자의 '더 많은 상호작용' 욕구를 충족시키기 위해 '정보 거래 및 배신' 메커니즘을 도입한다.')\n\n"
        "## Input Data:\n"
        "- Original Concept to Evolve: ```json\n{original_concept_json}\n```\n"
        "- User's Feedback (Interpret the underlying desire): {feedback}\n\n"
        "## Output Language Requirement:\n"
        "- **All generated text for the JSON output MUST be in rich, compelling, and natural KOREAN.**\n\n"
        "## Final Output Instruction:\n"
        "이제 'Regeneration Framework'에 따라 깊이 있게 사고한 결과를 바탕으로, 아래 JSON 형식에 맞춰 최종 결과물만을 생성해주세요. **JSON 코드 블록 외에 다른 설명, 주석, 사고 과정은 절대 포함하지 마세요.**\n"
        "```json\n"
        "{{\n"
        '    "theme": "[치료 계획에 따라 더욱 선명해지거나 새롭게 태어난 테마를 제시하세요.]",\n'
        '    "playerCount": "[진화된 컨셉에 가장 이상적인 플레이어 수를 제시하세요. 기존과 동일할 수도, 달라질 수도 있습니다.]",\n'
        '    "averageWeight": [피드백과 새로운 메커니즘을 반영한 목표 난이도를 1.0에서 5.0 사이의 숫자로 제시하세요],\n'
        '    "ideaText": "[기존 컨셉과 어떻게 달라졌으며, 새로운 플레이 경험이 어떻게 더 매력적으로 변했는지 핵심을 짚어 설명하세요.]",\n'
        '    "mechanics": "[치료 계획의 핵심적인 결과물입니다. 어떻게 수정되고, 추가되고, 삭제되었는지 명확히 설명하고, 이 새로운 메커니즘 조합이 어떻게 컨셉을 발전시켰는지 논리적으로 서술하세요.]",\n'
        '    "storyline": "[진화된 테마와 메커니즘에 걸맞게, 플레이어의 몰입감을 한층 더 끌어올릴 수 있도록 수정되거나 완전히 새로워진 스토리를 들려주세요.]"\n'
        "}}\n"
        "```"
    )
)
regenerate_concept_chain = LLMChain(llm=llm, prompt=regenerate_concept_prompt)

class GenerateConceptRequest(BaseModel):
    projectId: int = Field(..., example=1)
    theme: str = Field(..., example="우주 탐험")
    playerCount: str = Field(..., example="2~4명")
    averageWeight: float = Field(..., example=3.2, description="1.0(가벼움) ~ 5.0(무거움)")

class OriginalConcept(BaseModel):
    conceptId: int
    planId: int
    projectId: int
    theme: str
    playerCount: str
    averageWeight: float
    ideaText: str
    mechanics: str
    storyline: str
    createdAt: str

class RegenerateConceptRequest(BaseModel):
    originalConcept: OriginalConcept
    feedback: str = Field(..., example="조금 더 협력하는 느낌이 강했으면 좋겠어요.")

class ConceptResponse(BaseModel):
    conceptId: int
    planId: int
    projectId: int
    theme: str
    playerCount: str
    averageWeight: float
    ideaText: str
    mechanics: str
    storyline: str
    createdAt: str

def _parse_concept_from_llm(response_text: str) -> Dict[str, Any]:
    match = re.search(r"```json\s*(\{.*?\})\s*```", response_text, re.DOTALL)
    if match:
        json_str = match.group(1)
    else:
        json_str = response_text

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        print(f"JSON 파싱 실패. 원본 텍스트: {response_text}")
        raise ValueError("LLM 응답에서 유효한 JSON을 찾을 수 없습니다.")

@router.post("/generate-concept", response_model=ConceptResponse, summary="새로운 보드게임 컨셉 생성")
async def generate_concept_api(request: GenerateConceptRequest):
    retrieved_games_info = "유사 게임 정보를 찾을 수 없음."
    if retriever:
        try:
            search_query = f"테마: {request.theme}, 플레이 인원: {request.playerCount}, 난이도: {request.averageWeight}"
            docs = retriever.invoke(search_query)
            if docs:
                retrieved_games_info = "\n\n".join([doc.page_content for doc in docs])
        except Exception as e:
            print(f"Retriever 실행 중 오류: {e}")

    try:
        llm_input = {
            "theme": request.theme,
            "playerCount": request.playerCount,
            "averageWeight": request.averageWeight,
            "retrieved_games": retrieved_games_info
        }
        response = concept_generation_chain.invoke(llm_input)
        concept_data = _parse_concept_from_llm(response['text'])

        concept_data["conceptId"] = np.random.randint(1000, 9999)
        concept_data["planId"] = np.random.randint(1000, 9999)
        concept_data["projectId"] = request.projectId
        concept_data["createdAt"] = datetime.datetime.now().isoformat(timespec='seconds')
        
        return concept_data
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(f"컨셉 생성 중 서버 오류: {e}")
        raise HTTPException(status_code=500, detail=f"LLM 체인 실행 중 오류 발생: {str(e)}")

@router.post("/regenerate-concept", response_model=ConceptResponse, summary="기존 보드게임 컨셉 재생성")
async def regenerate_concept_api(request: RegenerateConceptRequest):
    try:
        original_concept_json_str = request.originalConcept.model_dump_json(indent=2)
        
        llm_input = {
            "original_concept_json": original_concept_json_str,
            "feedback": request.feedback,
        }
        response = regenerate_concept_chain.invoke(llm_input)
        concept_data = _parse_concept_from_llm(response['text'])

        concept_data["planId"] = request.originalConcept.planId
        concept_data["conceptId"] = np.random.randint(10000, 99999)
        concept_data["projectId"] = request.originalConcept.projectId
        concept_data["createdAt"] = datetime.datetime.now().isoformat(timespec='seconds')
        
        return concept_data
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(f"컨셉 재생성 중 서버 오류: {e}")
        raise HTTPException(status_code=500, detail=f"LLM 체인 실행 중 오류 발생: {str(e)}")