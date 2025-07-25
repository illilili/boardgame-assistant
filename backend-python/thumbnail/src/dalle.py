import os
import requests
from openai import OpenAI
from dotenv import load_dotenv
from thumbnail import generate_thumbnail_keywords
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_game_name(game_plan):
    # 게임명 추출 (간단 정규식)
    import re
    match = re.search(r'게임명:\s*([^\n]+)', game_plan)
    return match.group(1).strip() if match else "게임명 없음"

def generate_image_from_keywords(keywords, model="dall-e-3", size="1024x1024"):
    prompt = f"키워드를 기반으로 보드게임 대표 이미지를 생성해줘: {keywords}"
    try:
        response = client.images.generate(
            model=model,
            prompt=prompt,
            n=1,
            size=size
        )
        image_url = response.data[0].url
        return image_url
    except Exception as e:
        print(f"[DALL·E Error] {e}")
        return None

def overlay_game_name_on_image(image_url, game_name, output_path="thumbnail_with_title.png"):
    # 이미지 다운로드
    response = requests.get(image_url)
    img = Image.open(BytesIO(response.content)).convert("RGBA")

    # 폰트 설정 (윈도우 기본 폰트 경로 예시, 필요시 경로 수정)
    font_path = "C:/Users/User/Desktop/big_project/boardgame-assistant/boardgame-assistant/backend-python/thumbnail/GmarketSansTTFBold.ttf"
    # 이미지 높이에 따라 폰트 크기 동적 결정 (예: 높이의 10~15%)
    font_size = max(60, img.height // 15)
    font = ImageFont.truetype(font_path, font_size)

    # 텍스트 오버레이
    draw = ImageDraw.Draw(img)
    text = game_name

    # 여러 줄 처리
    lines = text.split('\n')
    line_heights = []
    line_widths = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_widths.append(bbox[2] - bbox[0])
        line_heights.append(bbox[3] - bbox[1])
    total_height = sum(line_heights)
    max_width = max(line_widths)

    # 전체 텍스트 블록의 시작 좌표 (중앙 정렬)
    x_block = (img.width - max_width) // 2
    y_block = ((img.height - total_height) // 2)-250

    # 각 줄을 중앙에 정렬하여 그림
    y = y_block
    outline_range = 3
    for i, line in enumerate(lines):
        line_width = line_widths[i]
        line_height = line_heights[i]
        x = (img.width - line_width) // 2
        # 테두리 효과
        for ox in range(-outline_range, outline_range + 1):
            for oy in range(-outline_range, outline_range + 1):
                if ox != 0 or oy != 0:
                    draw.text((x + ox, y + oy), line, font=font, fill=(0, 0, 0, 255))
        draw.text((x, y), line, font=font, fill=(255, 255, 255, 255))
        y += line_height

    img.save(output_path)
    print(f"이미지 저장됨: {output_path}")

if __name__ == "__main__":
    game_plan = """보드게임 기획서: 크로노스의 유산 (Chronos' Legacy)
 
게임명: 크로노스의 유산: 시간의 조율자들 (Chronos' Legacy: The Chrono-Harmonizers)장르: 전략, 자원 관리, 문명 발전, 영역 확장플레이어 수: 2-4인플레이 시간: 60-90분대상 연령: 12세 이상
 
1. 게임 개요 (Game Overview)
 
오래전, 시간의 신 크로노스는 필멸자들에게 시간을 다스리는 힘의 일부를 부여했습니다. 그러나 이 힘은 남용되어 시간의 흐름이 불안정해졌고, 세계는 혼돈에 빠졌습니다. 플레이어들은 '시간의 조율자'가 되어 파편화된 시간의 흐름을 안정시키고, 자신만의 문명을 발전시키며, 진정한 크로노스의 후계자가 되기 위한 경쟁을 벌입니다. 다양한 시대의 유물을 수집하고, 시간 에너지(Temporal Energy)를 효율적으로 관리하여 가장 강력하고 조화로운 문명을 건설하는 것이 목표입니다.
핵심 특징:
시간 자원 관리: '시간 에너지'라는 독특한 자원을 사용하여 행동 우선순위를 정하고, 과거/미래의 행동을 미리 계획하거나 되돌리는 등 전략적인 선택을 강요합니다.
유물 수집 및 능력 획득: 고대부터 미래까지 다양한 시대의 강력한 유물을 수집하여 문명에 고유한 능력을 부여하고 발전시킵니다.
테크 트리 발전: 여러 시대의 기술을 연구하여 새로운 건물, 유닛, 능력을 잠금 해제하며 문명을 심화시킵니다.
비대칭 능력: 각 플레이어는 시작 시 선택하는 '조율자' 종족에 따라 고유한 시작 능력과 목표를 가집니다. (예: 엘프 - 시간 에너지 효율, 드워프 - 유물 채굴 특화, 인간 - 빠른 확장)
다양한 승리 조건: 단순히 점수를 높이는 것을 넘어, 특정 유물 세트 완성, 시간 에너지 독점, 특정 시대 기술 완성 등 다양한 승리 경로를 제공하여 리플레이성을 높입니다.
 
2. 게임 목표 (Game Objective)
 
정해진 턴(시대)이 종료되었을 때, 또는 특정 즉시 승리 조건을 달성했을 때, 가장 높은 **크로노스 점수 (Chronos Score)**를 획득한 플레이어가 승리합니다.
크로노스 점수 획득 방법:
건물 건설 (가치에 따라 차등 점수)
유물 수집 (세트 완성 시 보너스 점수)
시대 연구 완료
영토 확장 및 특정 지역 통제
각 조율자 종족의 고유 목표 달성
즉시 승리 조건 (예시):
모든 플레이어의 문명 HP를 0으로 만들었을 때 (군사 승리)
모든 시대의 최상위 기술을 연구했을 때 (기술 승리)
특정 희귀 유물 세트 3개 이상을 완성했을 때 (유물 승리)
 
3. 구성 요소 (Game Components)
 
게임 보드:
중앙 '시간의 소용돌이' (액션 선택 트랙)
시대별 기술 연구 트랙 (고대, 중세, 근대, 미래)
자원 생산 지역 (크리스탈 광산, 고대 숲, 황금 유적 등)
건설 가능한 지역 (도시, 요새, 신비의 탑 등)
플레이어 보드 (4개):
자원 보관 구역 (금, 나무, 식량, 크리스탈)
시간 에너지 트랙 및 보관 구역
유닛 배치 및 관리 구역
건설된 건물 및 연구된 기술 표시 구역
조율자 종족 특성 표시 구역
카드:
유물 카드 (약 50장): 시대별 유물 (고대 유물, 중세 유물, 미래 기술 등)
행동 카드 (약 30장): 매 턴 선택 가능한 특별 행동 또는 이벤트
이벤트 카드 (약 20장): 특정 턴 또는 조건에 따라 발생하는 전역 이벤트
초기 조율자 카드 (4장): 각 플레이어가 선택하는 종족 (엘프, 드워프, 인간, 기계)
토큰 및 마커:
자원 토큰 (금, 나무, 식량, 크리스탈)
시간 에너지 토큰
문명 HP 마커
플레이어 순서 마커
점수 마커
유닛 마커 (각 종족별 특색 있는 모양)
주사위: 6면체 주사위 2개 (전투 및 특정 행동 결과 판정용)
 
4. 게임 플레이 (Gameplay)
 
A. 게임 준비:
게임 보드를 중앙에 펼치고 '시간의 소용돌이' 마커를 1시대에 놓습니다.
각 플레이어는 조율자 카드 1장과 해당 종족의 초기 자원, 유닛을 받습니다.
유물 카드 덱, 행동 카드 덱, 이벤트 카드 덱을 잘 섞어 보드에 배치합니다.
각 플레이어는 개인 보드를 받고 초기 자원을 세팅합니다.
무작위로 시작 플레이어를 정하고, 턴 순서를 결정합니다.
B. 게임 턴 진행:
게임은 총 GAME_RULES["max_turns"] (예: 20) 시대로 진행됩니다. 각 시대(턴)는 다음 페이즈로 구성됩니다:
시간 에너지 수급 페이즈 (LLM: resources_per_turn 적용):
각 플레이어는 자신의 문명 보드에 표시된 '시간 에너지' 및 resources_per_turn에 따라 기본 자원을 획득합니다.
이벤트 카드 1장을 공개하고, 카드에 따라 전역 효과를 적용합니다.
행동 선택 페이즈 (LLM: PlayerAI.choose_action 로직):
시작 플레이어부터 순서대로, 자신의 턴에 1가지 주 행동을 선택하고 수행합니다.
주요 행동 (예시 - GAME_RULES["actions"]와 연동):
자원 수집 (gather_X): 보드 특정 지역에서 자원을 획득합니다. (예: gather_gold, gather_wood, gather_food)
건물 건설: 자원을 소모하여 자신의 영토에 건물을 짓습니다. (예: build_barracks, build_farm)
건물은 자원 생산량 증가, 유닛 생산 능력, 문명 HP 증가 등 다양한 효과를 가집니다.
유닛 생산 (build_unit): 병영 등에서 유닛을 생산합니다. (예: build_basic_warrior, build_archer, build_tank)
유닛은 전투력, 방어력, 이동력 등의 스탯을 가집니다.
유물 탐색: 유물 카드 덱에서 유물 카드를 뽑습니다.
기술 연구: 기술 연구 트랙에서 다음 시대의 기술을 연구합니다. 자원과 '시간 에너지'를 소모하며, 연구가 완료되면 새로운 건물, 유닛, 행동 등이 잠금 해제됩니다.
공격 (attack_opponent): 유닛을 사용하여 다른 플레이어의 영토나 문명을 공격합니다.
전투: 플레이어의 유닛 공격력 합계와 상대방의 유닛 방어력 합계를 비교하여 피해량을 계산하고, 주사위 보정을 적용하여 상대 문명 HP를 감소시킵니다. (LLM: deal_damage 효과 및 amount_source 로직)
시간 에너지 조율 (특수 행동): 보유한 '시간 에너지'를 소모하여 특정 행동의 효율을 높이거나, 이미 발생한 행동을 일부 되돌리는 등의 능력을 사용합니다.
선택된 행동에 필요한 자원을 지불하고, 행동의 효과를 적용합니다.
정리 페이즈:
모든 플레이어가 행동을 마쳤으면, 사용된 '시간 에너지'를 재조정하고, 게임 보드의 '시간의 소용돌이' 마커를 다음 시대로 이동시킵니다.
패배 조건(loss_conditions)을 확인하여 패배한 플레이어가 있는지 확인합니다.
C. 게임 종료:
최대 턴(시대) 도달: GAME_RULES["max_turns"] 에 도달하면 게임이 즉시 종료됩니다.
즉시 승리 조건 달성: 특정 플레이어가 위에 명시된 즉시 승리 조건 중 하나를 달성하면, 게임이 즉시 종료되고 해당 플레이어가 승리합니다.
D. 승자 결정:
게임 종료 시, 각 플레이어는 최종 크로노스 점수를 합산하고, 가장 높은 점수를 가진 플레이어가 승리합니다. (동점일 경우 남은 시간 에너지, 유닛 수, 자원량 등 부가적인 규칙으로 승자를 판정) ..."""
    keywords = generate_thumbnail_keywords(game_plan)
    print("썸네일 키워드:", keywords)

    image_url = generate_image_from_keywords(keywords)
    print("이미지 URL:", image_url)

    # game_name = extract_game_name(game_plan)
    game_name = "크로노스의 유산 \n (Chronos Legacy)"
    # image_url = "https://oaidalleapiprodscus.blob.core.windows.net/private/org-spcHEmw6kcoImYOZSCguoRf6/user-q1TwXDmgUNsRfFYLJwy1s5BX/img-STIFQkeH1ZVi7uWAYl5YtdqY.png?st=2025-07-24T05%3A54%3A57Z&se=2025-07-24T07%3A54%3A57Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=52f8f7b3-ca8d-4b21-9807-8b9df114d84c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-24T06%3A54%3A57Z&ske=2025-07-25T06%3A54%3A57Z&sks=b&skv=2024-08-04&sig=U9/aBgZsloy9jzm9QlsNy/F1r0FPNU0NCEmth6gIWFk%3D"
    if image_url:
        overlay_game_name_on_image(image_url, game_name)
        print(f"게임명 '{game_name}'이(가) 이미지에 오버레이되었습니다.")