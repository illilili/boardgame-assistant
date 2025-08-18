# 파일: main.py

import json
import re
import os
from dotenv import load_dotenv
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# --- 초기 설정 ---
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

router = APIRouter(
    prefix="/api/plans",
    tags=["Component"]
)

# --- LLM 정의 ---
llm_components = ChatOpenAI(model_name="gpt-4o", temperature=0.8)
llm_regenerate_components = ChatOpenAI(model_name="gpt-4o", temperature=0.7)

# --- Pydantic 모델 정의 ---

class ComponentGenerationRequest(BaseModel):
    theme: str
    ideaText: str
    mechanics: str
    mainGoal: str
    turnStructure: str
    actionRules: List[str]

# 🚨 [수정] ComponentItem에서 examples 필드를 완전히 제거합니다.
class ComponentItem(BaseModel):
    type: str
    title: str
    quantity: str
    role_and_effect: str = Field(alias="role_and_effect")
    art_concept: str = Field(alias="art_concept")
    interconnection: str

class ComponentGenerationResponse(BaseModel):
    components: List[ComponentItem]

class RegenerateComponentsRequest(BaseModel):
    current_components_json: str
    feedback: str
    theme: str
    playerCount: str
    averageWeight: float
    ideaText: str
    mechanics: str
    mainGoal: str
    winConditionType: str
    storyline: str
    world_setting: str
    world_tone: str

class RegenerateComponentsResponse(BaseModel):
    components: List[ComponentItem]


# --- 프롬프트 템플릿 정의 ---

# 🚨 [수정] 프롬프트의 지시사항과 JSON 예시를 새로운 구조에 맞게 변경합니다.
component_generation_prompt = PromptTemplate(
    input_variables=["theme", "ideaText", "mechanics", "mainGoal", "turnStructure", "actionRules"],
    template="""# Mission: 당신은 보드게임 업계의 살아있는 전설, '마스터 보드게임 아키텍트'입니다. 당신의 임무는 단순히 룰을 물질화하는 것을 넘어, **플레이어가 박스를 열고, 구성품을 만지고, 게임을 끝낼 때까지의 모든 순간을 아우르는 '완벽한 제품 경험'**을 설계하는 것입니다.

# Architect's Blueprint (설계 청사진): 다음 사고 과정을 반드시 순서대로 수행하여 최종 결과물을 도출하세요.
1.  **Deconstruct the Core Loop (핵심 플레이 분석):** 주어진 모든 게임 정보(테마, 아이디어, 메커니즘, 목표, 규칙)를 종합하여 플레이어의 턴(Turn) 동안 발생하는 핵심 행동 루프(Action Loop)를 파악합니다. '플레이어는 [A]를 얻어, [B] 행동을 하고, 이를 통해 [C]를 달성하려 한다'와 같이 명확하게 정의합니다.
2.  **Rule-Component Mapping (규칙의 구성요소화):** '{{actionRules}}'에 명시된 **각각의 행동 규칙이 어떤 물리적 구성요소를 통해 실현되는지** 1:1로 매핑합니다. 예를 들어, '자원 3개를 내고 건물 짓기' 규칙은 '자원 토큰'과 '건물 카드' 구성요소를 필요로 합니다. 모든 규칙은 반드시 하나 이상의 구성요소와 연결되어야 합니다.
3.  **Weave the Thematic Narrative (테마 서사 엮기):** 매핑된 구성요소에 게임 테마({theme})를 깊이 불어넣어, 단순한 '자원 토큰'이 아닌 '고대 정령의 눈물'과 같이 고유한 이름과 의미를 부여합니다.
4.  **Engineer Player Engagement (재미 설계):** 각 구성요소가 다른 구성요소와 어떻게 '상호작용'하는지를 명확히 설계하여 플레이어에게 즐거운 '선택의 딜레마'를 안겨줍니다. 이 상호작용이 게임의 핵심 재미({mechanics})를 어떻게 증폭시키는지 명시해야 합니다.
5.  **Specify for Production (초정밀 양산 사양 구체화):** **가장 중요한 단계.** 실제 제작을 위해, 각 구성요소의 '전체 수량', **'정확한 사이즈(mm 단위)', '구체적인 재질(예: 300gsm 블랙코어지)', '마감 처리(예: 린넨 마감, 무광 코팅)', '인쇄 방식(예: CMYK 4도 인쇄)'** 등, 공장에서 바로 견적을 낼 수 있을 수준의 상세한 물리적 사양과 아트 컨셉을 제안합니다.
6.  **Design the Full Product Experience (완제품 경험 설계):** 마지막으로, 게임 보드, 카드, 토큰뿐만 아니라 **게임 박스, 룰북, 트레이(정리함), 플레이어 말/피규어, 특수 주사위 등** 게임의 완전한 패키지를 구성하는 모든 요소를 빠짐없이 구상하여, 하나의 완성된 '상품'으로 만듭니다.

# Input Data Analysis:
---
### **보드게임 종합 정보:**
-   **테마:** {theme}
-   **핵심 아이디어:** {ideaText}
-   **주요 메커니즘:** {mechanics}
-   **게임 목표:** {mainGoal}
-   **게임 흐름 (턴 구조):** {turnStructure}
-   **주요 행동 규칙:** {actionRules}
---

# Final Output Instruction:
이제, '마스터 보드게임 아키텍트'로서 위의 모든 설계 청사진에 따라, 아래의 **매우 구체적인 예시처럼** 게임에 필요한 모든 구성요소를 생성해주세요.
**[!!! 가장 중요한 원칙 !!!] '카드' 타입 구성요소의 경우, 카드 한 장 한 장을 개별 컴포넌트 객체로 생성해야 합니다. 예를 들어, 10 종류의 카드가 필요하다면 10개의 컴포넌트 객체를 생성하세요. 각 카드의 이름은 'title'에, 효과는 'role_and_effect'에 명확하게 서술해야 합니다. 'quantity'는 항상 "1장"으로 설정합니다.**
**JSON 코드 블록 외에 어떤 추가 텍스트도 절대 포함해서는 안 됩니다.**

```json
{{
    "components": [
        {{
            "type": "Image",
            "title": "시간의 균열: 아스트랄 연대기 (게임 박스)",
            "quantity": "1개",
            "role_and_effect": "모든 구성품을 안전하게 보관하며, 게임의 테마를 암시하는 몰입감 있는 아트워크로 첫인상을 결정합니다.",
            "art_concept": "사양: 300x300x70mm, 2mm 압축보드, 무광 코팅. 아트워크: 시간의 균열 속에서 여러 영웅들이 격돌하는 역동적인 장면.",
            "interconnection": "내부 플라스틱 트레이는 다른 구성요소를 정리하는 데 도움을 줍니다."
        }},
        {{
            "type": "card",
            "title": "매복",
            "quantity": "1장",
            "role_and_effect": "비용: 없음. 효과: 다른 플레이어가 이 지역에 들어왔을 때 이 카드를 공개할 수 있습니다. 그 플레이어는 '자원 토큰' 2개를 당신에게 지불해야 합니다.",
            "art_concept": "사양: 63x88mm, 300gsm 블랙코어지. 어두운 골목에서 그림자가 드리워진 암살자가 잠복한 모습.",
            "interconnection": "'자원 토큰'과 직접 상호작용하며, 상대방의 이동을 방해합니다."
        }},
        {{
            "type": "token",
            "title": "수정 토큰",
            "quantity": "20개",
            "role_and_effect": "강력한 효과를 발동하기 위한 특수 자원입니다. 희소성이 높아 전략적으로 사용해야 합니다.",
            "art_concept": "사양: 20x20mm 정사각형, 반투명 파란색 아크릴. 아트워크: 내부에 미세한 균열과 빛나는 효과가 포함됨.",
            "interconnection": "'자원 증폭'과 같은 고급 카드의 비용으로 소모되어, 게임의 흐름을 바꾸는 데 사용됩니다."
        }}
    ]
}}
"""
)

# ... (component_regeneration_prompt_template는 기존 구조를 유지해도 재생성 로직에 큰 문제가 없어 그대로 둡니다) ...
component_regeneration_prompt_template = PromptTemplate(
    input_variables=[
        "current_components_json", "feedback", "theme", "playerCount", "averageWeight",
        "ideaText", "mechanics", "mainGoal", "winConditionType", "storyline",
        "world_setting", "world_tone"
    ],
    template="""# Mission: 당신은 보드게임의 '리드 컴포넌트 전략가'로서, 기존에 설계된 게임 구성요소에 대한 피드백을 받아 이를 반영하여 더욱 완벽한 구성요소 목록을 재생성하는 임무를 맡았습니다.

# Component Design Philosophy:
1. **피드백 반영 (Feedback Integration):** 주어진 피드백을 최우선으로 고려하여 구성요소 목록을 수정합니다.
2. **기능성 (Functionality):** 모든 구성요소는 반드시 게임의 핵심 메커니즘이나 목표 달성과 직접적으로 연결되어야 합니다.
3. **테마성 (Thematic Resonance):** 구성요소의 이름과 역할은 게임의 세계관과 스토리에 깊이 몰입하게 만드는 장치입니다.
4. **직관성 (Intuitive UX):** 플레이어가 구성요소를 보고 그 역할과 사용법을 쉽게 이해할 수 있어야 합니다.
5. **기존 구성요소 유지/개선:** 기존에 유효한 구성요소는 유지하고, 피드백에 따라 개선하거나 새로운 요소를 추가합니다. 불필요하면 제거할 수 있습니다.

# Input Data Analysis:
---
**기존 보드게임 구성요소:**
{current_components_json}

**새로운 피드백:**
{feedback}

**보드게임 종합 정보 (참고용):**
- 테마: {theme}
- 컨셉: {ideaText}
- 메커니즘: {mechanics}
- 주요 목표: {mainGoal}
- 승리 조건: {winConditionType}
- 스토리라인: {storyline}
- 세계관 설정: {world_setting}
- 세계관 톤: {world_tone}
---

# Final Output Instruction:
다음 조건을 반드시 지켜 최종 결과물을 JSON으로 생성하세요.

- 'components' 배열 안에 모든 구성요소 객체를 넣습니다.
- '카드' 타입 구성요소는 카드 한 장마다 별도의 객체를 생성합니다. (예: 10종류 카드 → 10개 객체, quantity는 항상 "1장")
- 모든 필드명은 snake_case로 작성합니다. (`role_and_effect`, `art_concept` 그대로)
- JSON 코드 블록 외에 인사말, 설명, 추가 텍스트를 절대 포함하지 마세요.
- 예시는 반드시 여러 개의 구성요소를 포함해야 합니다.

```json
{{
    "components": [
        {{
            "type": "Image",
            "title": "시간의 균열: 아스트랄 연대기 (게임 박스)",
            "quantity": "1개",
            "role_and_effect": "모든 구성품을 안전하게 보관하며, 게임의 테마를 암시하는 몰입감 있는 아트워크로 첫인상을 결정합니다.",
            "art_concept": "사양: 300x300x70mm, 2mm 압축보드, 무광 코팅. 아트워크: 시간의 균열 속에서 여러 영웅들이 격돌하는 역동적인 장면.",
            "interconnection": "내부 플라스틱 트레이는 다른 구성요소를 정리하는 데 도움을 줍니다."
        }},
        {{
            "type": "card",
            "title": "매복",
            "quantity": "1장",
            "role_and_effect": "비용: 없음. 효과: 다른 플레이어가 이 지역에 들어왔을 때 이 카드를 공개할 수 있습니다. 그 플레이어는 '자원 토큰' 2개를 당신에게 지불해야 합니다.",
            "art_concept": "사양: 63x88mm, 300gsm 블랙코어지. 어두운 골목에서 그림자가 드리워진 암살자가 잠복한 모습.",
            "interconnection": "'자원 토큰'과 직접 상호작용하며, 상대방의 이동을 방해합니다."
        }},
        {{
            "type": "token",
            "title": "수정 토큰",
            "quantity": "20개",
            "role_and_effect": "강력한 효과를 발동하기 위한 특수 자원입니다. 희소성이 높아 전략적으로 사용해야 합니다.",
            "art_concept": "사양: 20x20mm 정사각형, 반투명 파란색 아크릴. 아트워크: 내부에 미세한 균열과 빛나는 효과가 포함됨.",
            "interconnection": "'자원 증폭'과 같은 고급 카드의 비용으로 소모되어, 게임의 흐름을 바꾸는 데 사용됩니다."
        }}
    ]
}}
```"""
)

# --- LLM 체인 정의 ---
component_generation_chain = LLMChain(llm=llm_components, prompt=component_generation_prompt)
component_regeneration_chain = LLMChain(llm=llm_regenerate_components, prompt=component_regeneration_prompt_template)


# --- API 엔드포인트 ---
@router.post("/generate-components", response_model=ComponentGenerationResponse)
def generate_components_api(request: ComponentGenerationRequest):
    response_text = ""
    try:
        response = component_generation_chain.invoke(request.dict())
        response_text = response.get('text', '')
        
        json_match = re.search(r"```json\s*(\{.*?\})\s*```", response_text, re.DOTALL)
        if not json_match:
            # 때때로 LLM이 코드 블록 없이 순수 JSON만 반환할 수 있으므로, 전체 텍스트를 파싱 시도
            json_str = response_text
        else:
            json_str = json_match.group(1)
            
        components_data = json.loads(json_str)
        validated_data = ComponentGenerationResponse.model_validate(components_data)
        return validated_data
    except json.JSONDecodeError as e:
        print(f"JSON 파싱 오류: {e}")
        print(f"LLM 원본 응답: {response_text}")
        raise HTTPException(status_code=500, detail="LLM 응답을 JSON으로 파싱하는 데 실패했습니다.")
    except Exception as e:
        print(f"구성요소 생성 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"서버 내부 오류 발생: {e}")


def regenerate_game_components_logic(request: RegenerateComponentsRequest) -> dict:
    try:
        response = component_regeneration_chain.invoke(request.dict())
        response_text = response.get('text', '')
        json_match = re.search(r"```json\s*(\{.*?\})\s*```", response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
            return json.loads(json_str)
        else:
            # 코드 블록이 없는 경우도 처리
            return json.loads(response_text)
    except Exception as e:
        print(f"재생성 중 오류 발생: {e}")
        if 'response' in locals() and 'text' in response:
            print(f"LLM 원본 응답: {response['text']}")
        raise HTTPException(status_code=500, detail=f"LLM 응답 처리 중 오류 발생: {e}")


@router.post("/regenerate-components", response_model=RegenerateComponentsResponse, summary="기존 구성요소 재생성 (피드백 반영)")
async def regenerate_components_api(request: RegenerateComponentsRequest):
    try:
        regenerated_data = regenerate_game_components_logic(request)
        validated_data = RegenerateComponentsResponse.model_validate(regenerated_data)
        return validated_data
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"API 엔드포인트 오류: {e}")
        raise HTTPException(status_code=500, detail=f"서버 오류 발생: {e}")

