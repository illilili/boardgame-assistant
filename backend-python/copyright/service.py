from .schemas import PlanCopyrightCheckRequest, PlanCopyrightCheckResponse
from .gpt_processor import GameDataExtractor
from .copyright_analyzer import CopyrightAnalyzer

class CopyrightService:
    def __init__(self):
        self.data_extractor = GameDataExtractor()
        self.copyright_analyzer = CopyrightAnalyzer()
    
    async def check_plan_copyright(self, request: PlanCopyrightCheckRequest) -> PlanCopyrightCheckResponse:
        """
        전체 저작권 검사 워크플로우를 실행합니다.
        
        1. summaryText에서 구조화된 데이터 추출
        2. GPT로 영어 번역
        3. MiniLM-L12-v2로 유사도 검사
        4. 저작권 분석 결과 반환
        """
        try:
            # 1. 데이터 추출 및 번역
            translated_data = await self.data_extractor.process_plan(
                request.planId, 
                request.summaryText
            )
            
            # 2. 저작권 분석
            result = await self.copyright_analyzer.analyze_copyright(translated_data)
            
            return result
            
        except Exception as e:
            # 오류 발생 시 기본 응답 반환
            return PlanCopyrightCheckResponse(
                planId=request.planId,
                riskLevel="LOW",
                similarGames=[],
                analysisSummary=f"분석 중 오류가 발생했습니다: {str(e)}"
            )