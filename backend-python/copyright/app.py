from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import logging
import os
from datetime import datetime
import asyncio
from contextlib import asynccontextmanager

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 전역 서비스 인스턴스
copyright_service = None
service_error = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 시작/종료 시 실행되는 함수"""
    global service_error
    
    # 시작 시
    try:
        await initialize_service()
        logger.info("🚀 FastAPI 서버 시작 완료")
    except Exception as e:
        # 서비스 초기화 실패해도 서버는 시작되도록 함
        service_error = str(e)
        logger.error(f"⚠️ 서비스 초기화 실패, 하지만 서버는 시작됨: {e}")
    
    yield
    
    # 종료 시
    logger.info("🛑 FastAPI 서버 종료")

async def initialize_service():
    """서비스 초기화 (비동기) - 오류 처리 개선"""
    global copyright_service, service_error
    
    try:
        logger.info("📚 저작권 검사 서비스 초기화 시도 중...")
        
        # 필요한 모듈들이 있는지 확인
        try:
            from service import FaissCopyrightCheckService
        except ImportError as e:
            raise Exception(f"service.py 모듈을 찾을 수 없습니다: {e}")
        
        copyright_service = FaissCopyrightCheckService()
        
        # 게임 데이터 파일 경로 확인
        json_file_path = os.getenv('GAME_DATA_PATH', 'data/boardgame_detaildata_1-101_NaN 문자.json')
        
        if not os.path.exists(json_file_path):
            raise Exception(f"게임 데이터 파일을 찾을 수 없습니다: {json_file_path}")
        
        # 비동기로 데이터베이스 초기화
        await asyncio.get_event_loop().run_in_executor(
            None, 
            copyright_service.initialize_database, 
            json_file_path, 
            False
        )
        
        logger.info("✅ 저작권 검사 서비스 초기화 완료")
        service_error = None
        
    except Exception as e:
        service_error = str(e)
        logger.error(f"❌ 서비스 초기화 실패: {e}")
        # 예외를 다시 발생시키지 않음 - 서버는 시작되도록 함

# FastAPI 앱 초기화
app = FastAPI(
    title="보드게임 저작권 검사 API",
    description="Faiss 기반 고도화된 보드게임 저작권 검사 시스템",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic 모델들
class CopyrightCheckRequest(BaseModel):
    game_title: str = Field(..., description="게임 제목", min_length=1, max_length=100)
    game_plan: str = Field(..., description="게임 기획서 내용", min_length=10)

class CopyrightCheckResponse(BaseModel):
    game_title: str
    decision: str  # APPROVED, REJECTED
    max_similarity_score: float
    reasoning: str
    top_similar_games: List[Dict[str, Any]]
    comparison_details: Optional[Dict[str, Any]]
    processing_time: str
    total_games_checked: int
    search_queries_used: int
    data_source: str
    performance_stats: Dict[str, Any]

@app.get("/", summary="API 정보")
async def root():
    """루트 경로 - API 정보"""
    global service_error
    
    return {
        "message": "보드게임 저작권 검사 API",
        "version": "1.0.0",
        "copyright_check": "/api/plans/copyright-plan",
        "service_ready": copyright_service is not None,
        "service_error": service_error if service_error else None
    }

@app.post("/api/plans/copyright-plan", 
         response_model=CopyrightCheckResponse,
         summary="보드게임 저작권 검사",
         description="게임 기획서를 분석하여 기존 게임들과의 유사도를 검사합니다.")
async def check_copyright_plan(request: CopyrightCheckRequest):
    """
    보드게임 저작권 검사 API
    
    - **game_title**: 게임 제목
    - **game_plan**: 게임 기획서 내용 (최소 10자 이상)
    
    Returns:
    - **decision**: APPROVED(승인) 또는 REJECTED(반려)
    - **max_similarity_score**: 최대 유사도 점수 (0.0 ~ 1.0)
    - **reasoning**: 판정 근거
    - **top_similar_games**: 유사한 게임 목록 (상위 5개)
    - **comparison_details**: 반려시 상세 비교 분석
    """
    global copyright_service, service_error
    
    # 서비스 상태 확인
    if copyright_service is None:
        error_msg = f"저작권 검사 서비스가 초기화되지 않았습니다. 오류: {service_error}"
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "service_unavailable",
                "message": error_msg,
                "suggestion": "서버 관리자에게 문의하거나 데이터 파일 설정을 확인해주세요."
            }
        )
    
    try:
        # 저작권 검사 실행
        logger.info(f"저작권 검사 요청: {request.game_title}")
        
        result = await asyncio.get_event_loop().run_in_executor(
            None,
            copyright_service.check_copyright,
            request.game_plan,
            request.game_title
        )
        
        logger.info(f"저작권 검사 완료: {request.game_title} - {result['decision']}")
        
        return CopyrightCheckResponse(**result)
        
    except Exception as e:
        logger.error(f"저작권 검사 중 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "processing_error",
                "message": f"저작권 검사 처리 중 오류가 발생했습니다: {str(e)}",
                "game_title": request.game_title
            }
        )

@app.get("/api/status", summary="서비스 상태 확인")
async def get_service_status():
    """서비스 상태 상세 정보"""
    global copyright_service, service_error
    
    if copyright_service is None:
        return {
            "service_ready": False,
            "error": service_error,
            "message": "저작권 검사 서비스가 초기화되지 않았습니다."
        }
    
    try:
        stats = copyright_service.get_database_stats()
        return {
            "service_ready": True,
            "database_stats": stats,
            "message": "저작권 검사 서비스가 정상 작동 중입니다."
        }
    except Exception as e:
        return {
            "service_ready": False,
            "error": str(e),
            "message": "서비스 상태 확인 중 오류가 발생했습니다."
        }

# 서버 실행 부분 수정
if __name__ == "__main__":
    import uvicorn
    
    # 환경변수에서 포트 가져오기, 기본값 8000
    port = int(os.getenv('PORT', 8000))
    host = os.getenv('HOST', '0.0.0.0')
    
    print(f"🚀 FastAPI 서버 시작 중...")
    print(f"   주소: http://{host}:{port}")
    print(f"   저작권 검사: http://{host}:{port}/api/plans/copyright-plan")
    
    try:
        uvicorn.run(
            "app:app",
            host=host,
            port=port,
            reload=False,  # 프로덕션에서는 False
            log_level="info",
            access_log=True
        )
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        print("다음 사항들을 확인해주세요:")
        print(f"1. 포트 {port}가 사용 중인지 확인")
        print("2. 필요한 모듈들이 설치되어 있는지 확인")
        print("3. requirements.txt의 패키지들이 모두 설치되어 있는지 확인")