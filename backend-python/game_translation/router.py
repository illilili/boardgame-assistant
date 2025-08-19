from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, List
import logging

from .schema import GameTranslationRequest, GameTranslationResponse, BatchTranslationRequest, BatchTranslationResponse
from .service import GameTranslationService

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/translation",
    tags=["게임 번역"]
)

# 번역 서비스 인스턴스 (지연 초기화)
translation_service = None

def get_translation_service():
    global translation_service
    if translation_service is None:
        translation_service = GameTranslationService()
    return translation_service


@router.post("/game", response_model=GameTranslationResponse)
async def translate_game(request: GameTranslationRequest):
    """개별 게임 정보 번역"""
    
    try:
        logger.info(f"게임 번역 요청: categories={len(request.categories or [])}, mechanics={len(request.mechanics or [])}, description={'있음' if request.description else '없음'}")
        
        # 번역 실행
        service = get_translation_service()
        translation_result = await service.translate_game_data(
            categories=request.categories,
            mechanics=request.mechanics,
            description=request.description
        )
        
        response = GameTranslationResponse(
            categories=translation_result.get("categories"),
            mechanics=translation_result.get("mechanics"),
            description=translation_result.get("description"),
            success=True,
            message="번역이 성공적으로 완료되었습니다."
        )
        
        logger.info("게임 번역 완료")
        return response
        
    except Exception as e:
        logger.error(f"게임 번역 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"번역 중 오류가 발생했습니다: {str(e)}"
        )


@router.post("/batch", response_model=BatchTranslationResponse)
async def translate_batch(request: BatchTranslationRequest):
    """여러 게임 정보 배치 번역"""
    
    try:
        logger.info(f"배치 번역 요청: {len(request.games)}개 게임")
        
        # 요청 데이터 변환
        games_data = []
        for game in request.games:
            game_dict = {}
            if game.categories:
                game_dict["categories"] = game.categories
            if game.mechanics:
                game_dict["mechanics"] = game.mechanics
            if game.description:
                game_dict["description"] = game.description
            games_data.append(game_dict)
        
        # 배치 번역 실행
        service = get_translation_service()
        translation_results = await service.translate_batch(games_data)
        
        # 응답 데이터 구성
        translations = []
        success_count = 0
        failure_count = 0
        
        for i, result in enumerate(translation_results):
            if isinstance(result, Exception):
                failure_count += 1
                translations.append(GameTranslationResponse(
                    categories=request.games[i].categories,  # 원본 반환
                    mechanics=request.games[i].mechanics,    # 원본 반환
                    description=request.games[i].description, # 원본 반환
                    success=False,
                    message=f"번역 실패: {str(result)}"
                ))
            else:
                success_count += 1
                translations.append(GameTranslationResponse(
                    categories=result.get("categories"),
                    mechanics=result.get("mechanics"),
                    description=result.get("description"),
                    success=True,
                    message="번역 성공"
                ))
        
        response = BatchTranslationResponse(
            translations=translations,
            total_processed=len(request.games),
            success_count=success_count,
            failure_count=failure_count,
            success=success_count > 0
        )
        
        logger.info(f"배치 번역 완료: {success_count}/{len(request.games)}개 성공")
        return response
        
    except Exception as e:
        logger.error(f"배치 번역 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"배치 번역 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """번역 서비스 상태 확인"""
    try:
        # OpenAI API 키 확인
        import os
        api_key = os.getenv("OPENAI_API_KEY")
        
        return {
            "status": "healthy",
            "service": "game_translation",
            "openai_api_configured": bool(api_key),
            "model": "gpt-3.5-turbo"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"서비스 상태 확인 실패: {str(e)}"
        )


@router.post("/categories")
async def translate_categories_only(categories: List[str]):
    """카테고리만 번역"""
    try:
        service = get_translation_service()
        translated = await service.translate_categories(categories)
        return {
            "original": categories,
            "translated": translated,
            "success": True
        }
    except Exception as e:
        logger.error(f"카테고리 번역 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"카테고리 번역 실패: {str(e)}"
        )


@router.post("/mechanics")
async def translate_mechanics_only(mechanics: List[str]):
    """메카닉만 번역"""
    try:
        service = get_translation_service()
        translated = await service.translate_mechanics(mechanics)
        return {
            "original": mechanics,
            "translated": translated,
            "success": True
        }
    except Exception as e:
        logger.error(f"메카닉 번역 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"메카닉 번역 실패: {str(e)}"
        )


@router.post("/description")
async def translate_description_only(request: dict):
    """설명만 번역"""
    try:
        # JSON 객체에서 description 추출
        description = request.get("description") if isinstance(request, dict) else str(request)
        
        if not description or not description.strip():
            raise HTTPException(status_code=400, detail="설명이 비어있습니다")
            
        logger.info(f"설명 번역 요청: {len(description)}글자")
        
        service = get_translation_service()
        translated = await service.translate_description(description)
        return {
            "original": description,
            "translated": translated,
            "success": True
        }
    except Exception as e:
        logger.error(f"설명 번역 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"설명 번역 실패: {str(e)}"
        )


@router.post("/batch-optimized")
async def translate_batch_optimized(request: dict):
    """최적화된 배치 번역 - 중복 제거 및 한 번의 API 호출"""
    try:
        games = request.get("games", [])
        if not games:
            raise HTTPException(status_code=400, detail="번역할 게임 데이터가 없습니다")
        
        # 1단계: 모든 고유한 카테고리와 메카닉 수집
        all_categories = []
        all_mechanics = []
        
        for game in games:
            categories = game.get("categories", [])
            mechanics = game.get("mechanics", [])
            all_categories.extend(categories)
            all_mechanics.extend(mechanics)
        
        logger.info(f"최적화된 배치 번역 시작: 총 {len(games)}개 게임, {len(set(all_categories))}개 고유 카테고리, {len(set(all_mechanics))}개 고유 메카닉")
        
        # 입력 게임 데이터 디버깅 로그
        logger.info("입력 게임 데이터 (처음 3개):")
        for i, game in enumerate(games[:3]):
            logger.info(f"  [{i}] ID: {game.get('id')}, Name: {game.get('name')}, Rank: {game.get('rank')}")
        if len(games) >= 25:
            logger.info("입력 게임 데이터 (마지막 3개):")
            for i, game in enumerate(games[-3:], len(games) - 3):
                logger.info(f"  [{i}] ID: {game.get('id')}, Name: {game.get('name')}, Rank: {game.get('rank')}")
        
        # 2단계: 배치 번역 수행 (중복 제거하여 한 번만 번역)
        service = get_translation_service()
        translation_map = await service.translate_batch_categories_and_mechanics(
            all_categories, all_mechanics
        )
        
        # 3단계: 각 게임에 번역 결과 적용
        translated_games = []
        
        for game in games:
            translated_game = {**game}
            
            # 카테고리 번역 적용
            if game.get("categories"):
                translated_categories = [
                    translation_map.get(cat, cat) for cat in game["categories"]
                ]
                translated_game["categories"] = translated_categories
                translated_game["categoriesOriginal"] = game["categories"]
            
            # 메카닉 번역 적용
            if game.get("mechanics"):
                translated_mechanics = [
                    translation_map.get(mech, mech) for mech in game["mechanics"] 
                ]
                translated_game["mechanics"] = translated_mechanics
                translated_game["mechanicsOriginal"] = game["mechanics"]
            
            translated_games.append(translated_game)
        
        # 출력 게임 데이터 디버깅 로그
        logger.info(f"번역 완료: 총 {len(translated_games)}개 게임")
        logger.info("출력 게임 데이터 (처음 3개):")
        for i, game in enumerate(translated_games[:3]):
            logger.info(f"  [{i}] ID: {game.get('id')}, Name: {game.get('name')}, Rank: {game.get('rank')}")
        if len(translated_games) >= 25:
            logger.info("출력 게임 데이터 (마지막 3개):")
            for i, game in enumerate(translated_games[-3:], len(translated_games) - 3):
                logger.info(f"  [{i}] ID: {game.get('id')}, Name: {game.get('name')}, Rank: {game.get('rank')}")
                
        return {
            "success": True,
            "games": translated_games,
            "count": len(translated_games),
            "translation_stats": {
                "unique_categories": len(set(all_categories)),
                "unique_mechanics": len(set(all_mechanics)),
                "translation_map_size": len(translation_map)
            }
        }
        
    except Exception as e:
        logger.error(f"최적화된 배치 번역 실패: {e}")
        raise HTTPException(status_code=500, detail=f"배치 번역 실패: {str(e)}")