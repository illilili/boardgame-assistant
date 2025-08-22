import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './OriginalGameAnalysis.css';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import { 
  fetchOriginalDashboard, 
  formatTrendApiError
} from './services/trendApiService';
import BubbleChartVisualization from './components/interactive/BubbleChartVisualization';

const OriginalGameAnalysis = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  
  // 시각화 차트 상태
  const [bubbleChartData, setBubbleChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartGroupBy, setChartGroupBy] = useState('categories'); // 카테고리별/메커니즘별 토글
  
  // 상세 정보 모달 상태
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 차트 그룹화 기준 변경 시 데이터 다시 로드
  useEffect(() => {
    if (dashboardData) {
      loadChartData();
    }
  }, [chartGroupBy, dashboardData]); // eslint-disable-line react-hooks/exhaustive-deps

  // 테마 번역 함수
  const translateTheme = useCallback((englishTheme) => {
    // 데이터 정리: 백슬래시 제거
    const cleanedTheme = englishTheme?.replace(/\\/g, '');
    
    const themeTranslations = {
      'Age of Reason': '이성의 시대',
      'Economic': '경제',
      'Industry / Manufacturing': '산업/제조업',
      'Post-Napoleonic': '나폴레옹 이후',
      'Trains': '기차',
      'Transportation': '교통',
      'Environmental': '환경',
      'Medical': '의료',
      'Animals': '동물',
      'Card Game': '카드게임',
      'Adventure': '모험',
      'Exploration': '탐험',
      'Fantasy': '판타지',
      'Fighting': '전투',
      'Miniatures': '미니어처',
      'Civilization': '문명',
      'Negotiation': '협상',
      'Political': '정치',
      'Science Fiction': '공상과학',
      'Movies / TV / Radio theme': '영화/TV/라디오 테마',
      'Novel-based': '소설 기반',
      'Space Exploration': '우주 탐험',
      'Civil War': '내전',
      'Wargame': '워게임',
      'Territory Building': '영토 건설',
      'Abstract Strategy': '추상 전략',
      'Ancient': '고대',
      'Bluffing': '블러핑',
      'City Building': '도시 건설',
      'Deduction': '추론',
      'Dice': '주사위',
      'Educational': '교육',
      'Expansion for Base-game': '기본게임 확장',
      'Horror': '호러',
      'Humor': '유머',
      'Mafia': '마피아',
      'Maritime': '해양',
      'Math': '수학',
      'Mature / Adult': '성인',
      'Medieval': '중세',
      'Memory': '기억력',
      'Mythology': '신화',
      'Nautical': '항해',
      'Number': '숫자',
      'Party Game': '파티 게임',
      'Pirates': '해적',
      'Prehistoric': '선사시대',
      'Print & Play': '인쇄하여 플레이',
      'Puzzle': '퍼즐',
      'Racing': '레이싱',
      'Real-time': '실시간',
      'Religious': '종교',
      'Renaissance': '르네상스',
      'Sports': '스포츠',
      'Spies/Secret Agents': '스파이/비밀요원',
      'Trivia': '퀴즈',
      'Video Game Theme': '비디오게임 테마',
      'Vikings': '바이킹',
      'War': '전쟁',
      'Western': '서부',
      'Word Game': '단어게임',
      'Zombies': '좀비'
    };
    
    return themeTranslations[cleanedTheme] || cleanedTheme;
  }, []);

  // 난이도 번역 함수  
  const translateDifficulty = (englishDifficulty) => {
    const difficultyTranslations = {
      'Very Light': '매우 쉬움',
      'Light': '쉬움', 
      'Medium Light': '보통-쉬움',
      'Medium': '보통',
      'Medium Heavy': '보통-어려움',
      'Heavy': '어려움',
      'Very Heavy': '매우 어려움'
    };
    
    return difficultyTranslations[englishDifficulty] || englishDifficulty;
  };

  // 메커니즘 번역 함수
  const translateMechanism = useCallback((englishMechanism) => {
    // 데이터 정리: 백슬래시 제거
    const cleanedMechanism = englishMechanism?.replace(/\\/g, '');
    
    const mechanismTranslations = {
      'Hand Management': '핸드 관리',
      'Set Collection': '세트 수집',
      'Tile Placement': '타일 배치',
      'Worker Placement': '일꾼 배치',
      'Dice Rolling': '주사위 굴리기',
      'Area Control / Area Influence': '지역 지배/영향력',
      'Card Drafting': '카드 드래프팅',
      'Route/Network Building': '경로/네트워크 구축',
      'Variable Player Powers': '가변적 플레이어 능력',
      'Engine Building': '엔진 빌딩',
      'Action Point Allowance System': '행동력 배분 시스템',
      'Simultaneous Action Selection': '동시 행동 선택',
      'Modular Board': '모듈식 보드',
      'Trading': '거래',
      'Auction/Bidding': '경매/입찰',
      'Co-operative Play': '협력 플레이',
      'Grid Movement': '격자 이동',
      'Pattern Building': '패턴 구축',
      'Trick-taking': '트릭 테이킹',
      'Storytelling': '스토리텔링',
      'Role Playing': '롤플레이',
      'Memory': '기억력',
      'Partnerships': '파트너십',
      'Simulation': '시뮬레이션',
      'Stock Holding': '주식 보유',
      'Commodity Speculation': '상품 투기',
      'Betting/Wagering': '베팅/도박',
      'Rock-Paper-Scissors': '가위바위보',
      'Paper-and-Pencil': '종이와 연필',
      'Acting': '연기',
      'Singing': '노래',
      'Press Your Luck': '운 시험하기',
      'Team Play': '팀 플레이',
      'Campaign / Battle Card Driven': '캠페인/배틀 카드 주도',
      'Hex-and-Counter': '헥스 앤 카운터',
      'Chit-Pull System': '칩 뽑기 시스템',
      'Area Movement': '구역 이동',
      'Point to Point Movement': '지점 간 이동',
      'Secret Unit Deployment': '비밀 유닛 배치',
      'Line Drawing': '선 그리기',
      'Player Elimination': '플레이어 제거',
      'Take That': '견제',
      'Roll / Spin and Move': '굴리고 이동',
      'Crayon Rail System': '크레용 철도 시스템',
      'Pick-up and Deliver': '수집 및 배송',
      'Voting': '투표',
      'Card Play Conflict Resolution': '카드 플레이 충돌 해결',
      'Hexagon Grid': '육각형 격자',
      'Open Drafting': '오픈 드래프팅',
      'Cooperative Game': '협력 게임',
      'Area Majority / Influence': '지역 다수/영향력',
      'Deck Building': '덱 빌딩',
      'Push Your Luck': '운 시험하기',
      'Hidden Roles': '숨겨진 역할',
      'Deduction': '추리',
      'Real Time': '실시간',
      'Semi-Cooperative Game': '반협력 게임',
      'Variable Phase Order': '가변 단계 순서',
      'Variable Setup': '가변 설정',
      'Map Addition': '지도 확장',
      'Income': '수입',
      'End Game Bonuses': '게임 종료 보너스',
      'Contracts': '계약',
      'Multi-Use Cards': '다목적 카드',
      'Solo / Solitaire Game': '솔로/솔리테어 게임',
      'Legacy Game': '레거시 게임',
      'Action Points': '행동 포인트',
      'Deck, Bag, and Pool Building': '덱/백/풀 빌딩',
      'Bag and Pool Building': '백/풀 빌딩',
      'Pool Building': '풀 빌딩',
      'Action Point Allowance': '행동 포인트 할당',
      'Action Drafting': '행동 드래프팅',
      'Action Queue': '행동 대기열',
      'Action Retrieval': '행동 회수',
      'Advantage Token': '유리 토큰',
      'Alliances': '동맹',
      'Automatic Resource Growth': '자동 자원 증가',
      'Bingo': '빙고',
      'Bias': '편향',
      'Bribery': '뇌물',
      'Catch the Leader': '선두 추격',
      'Command Cards': '명령 카드',
      'Communication Limits': '의사소통 제한',
      'Constrained Bidding': '제한 입찰',
      'Cube Tower': '큐브 타워',
      'Elapsed Real Time Ending': '실시간 종료',
      'Events': '이벤트',
      'Finale Ending': '피날레 종료',
      'Fixed Order Phase': '고정 순서 단계',
      'Follow': '따라하기',
      'Force Commitment': '강제 약속',
      'Hidden Movement': '숨겨진 이동',
      'Hot Potato': '핫 포테이토',
      'I Cut, You Choose': '내가 자르고 네가 선택',
      'Impulse Movement': '충동 이동',
      'Increase Value of Unchosen Resources': '선택되지 않은 자원 가치 증가',
      'Layering': '레이어링',
      'Mancala': '만칼라',
      'Market': '시장',
      'Measurement Movement': '측정 이동',
      'Melding and Splaying': '결합과 펼치기',
      'Move Through Deck': '덱 이동',
      'Multiple Maps': '다중 맵',
      'Neighbor Scope': '인접 범위',
      'Network and Route Building': '네트워크와 경로 구축',
      'Once-Per-Game Abilities': '게임당 한 번 능력',
      'Order Counters': '순서 카운터',
      'Passed Action Token': '전달된 행동 토큰',
      'Physical Removal': '물리적 제거',
      'Pieces as Map': '말을 맵으로',
      'Programmed Movement': '프로그래밍된 이동',
      'Race': '레이스',
      'Random Production': '무작위 생산',
      'Relative Movement': '상대적 이동',
      'Resource to Move': '이동을 위한 자원',
      'Rondel': '론델',
      'Score-and-Reset Game': '점수와 리셋 게임',
      'Slide/Push': '밀기/누르기',
      'Speed Matching': '속도 매칭',
      'Square Grid': '정사각형 격자',
      'Stacking and Balancing': '쌓기와 균형',
      'Static Capture': '정적 포획',
      'Sudden Death Ending': '서든 데스 종료',
      'Tags': '태그',
      'Three Dimensional Movement': '3차원 이동',
      'Tug of War': '줄다리기',
      'Turn Order: Auction': '턴 순서: 경매',
      'Turn Order: Claim Action': '턴 순서: 행동 선점',
      'Turn Order: Pass Order': '턴 순서: 패스 순서',
      'Turn Order: Progressive': '턴 순서: 점진적',
      'Turn Order: Random': '턴 순서: 무작위',
      'Turn Order: Role Order': '턴 순서: 역할 순서',
      'Turn Order: Stat-Based': '턴 순서: 스탯 기반',
      'Victory Points as a Resource': '승점을 자원으로'
    };
    
    return mechanismTranslations[cleanedMechanism] || cleanedMechanism;
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 기존 보드게임 대시보드 데이터 로드 시작');
      
      const result = await fetchOriginalDashboard();
      setDashboardData(result);
      
      console.log('✅ 기존 보드게임 대시보드 데이터 로드 완료:', result);
      
    } catch (err) {
      console.error('❌ 기존 보드게임 대시보드 데이터 로드 오류:', err);
      const userFriendlyError = formatTrendApiError(err);
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  // 4사분면 분석 함수 - 차트별 독립 기준점 (useCallback으로 래핑하여 의존성 최적화)
  const analyzeQuadrant = useCallback((avgRating, avgComplexity, chartType = 'categories') => {
    let ratingThreshold, complexityThreshold;
    
    if (chartType === 'categories' || chartGroupBy === 'categories') {
      // 카테고리/테마 차트: 기존 기준점
      ratingThreshold = 7.0;
      complexityThreshold = 2.25;
      console.log('📊 카테고리 버블차트 - 기준점:', { ratingThreshold, complexityThreshold });
    } else {
      // 메커니즘 차트: 조정된 기준점
      ratingThreshold = 7.15;
      complexityThreshold = 2.45;
      console.log('🔧 메커니즘 버블차트 - 기준점:', { ratingThreshold, complexityThreshold });
    }
    
    if (avgRating >= ratingThreshold && avgComplexity >= complexityThreshold) {
      return {
        quadrant: 'top-right',
        name: '🔥 고위험 고수익',
        title: '고평점 · 고난이도 영역',
        description: '높은 평점을 받지만 난이도가 높은 영역입니다. 숙련된 게이머들이 선호하며, 깊이 있는 게임 경험을 제공합니다.',
        marketInsight: '전문 게이머 타겟, 프리미엄 시장',
        strategy: '복잡하지만 보상이 큰 게임 메카닉을 활용하세요',
        riskLevel: 'high',
        color: '#722ed1'
      };
    } else if (avgRating < ratingThreshold && avgComplexity >= complexityThreshold) {
      return {
        quadrant: 'top-left',
        name: '⚠️ 위험 영역',
        title: '저평점 · 고난이도 영역',
        description: '난이도는 높지만 평점이 낮은 영역입니다. 복잡함에 비해 재미가 부족할 수 있어 주의가 필요합니다.',
        marketInsight: '개발 시 신중한 접근 필요',
        strategy: '게임성을 높이거나 난이도를 조정하는 것을 고려하세요',
        riskLevel: 'very-high',
        color: '#f5222d'
      };
    } else if (avgRating >= ratingThreshold && avgComplexity < complexityThreshold) {
      return {
        quadrant: 'bottom-right',
        name: '✨ 대중적 성공',
        title: '고평점 · 저난이도 영역',
        description: '높은 평점에 접근성도 좋은 최고의 영역입니다. 대중적 성공과 상업적 성과를 동시에 기대할 수 있습니다.',
        marketInsight: '베스트셀러 잠재력, 대중 시장',
        strategy: '이 영역의 성공 요소를 분석하여 활용하세요',
        riskLevel: 'low',
        color: '#52c41a'
      };
    } else {
      return {
        quadrant: 'bottom-left',
        name: '🎯 진입 기회',
        title: '저평점 · 저난이도 영역',
        description: '아직 개발이 덜 된 블루오션 영역입니다. 혁신적인 아이디어로 시장을 선도할 기회가 있습니다.',
        marketInsight: '블루오션, 혁신 기회',
        strategy: '새로운 접근법으로 이 영역을 개척해보세요',
        riskLevel: 'medium',
        color: '#faad14'
      };
    }
  }, [chartGroupBy]);

  // TOP10 테마/메커니즘 기반 버블차트 데이터 생성
  const generateBubbleChartData = useCallback(() => {
    if (!dashboardData) return [];
    
    const data = [];
    
    if (chartGroupBy === 'categories' && dashboardData.themes) {
      // TOP 15 테마 데이터로 버블차트 생성
      const topThemes = dashboardData.themes.slice(0, 15);
      
      topThemes.forEach((theme) => {
        // 백엔드에서 계산된 실제 평균 평점 및 난이도 사용
        const avgRating = parseFloat(theme.avgRating || 0);
        const avgComplexity = parseFloat(theme.avgComplexity || 0);
        
        // 4사분면 분석
        const quadrantAnalysis = analyzeQuadrant(avgRating, avgComplexity, 'categories');
        
        data.push({
          x: parseFloat(avgRating.toFixed(2)),
          y: parseFloat(avgComplexity.toFixed(2)),
          size: theme.count,
          group: translateTheme(theme.theme),
          category: translateTheme(theme.theme),
          percentage: theme.percentage,
          count: theme.count,
          type: 'theme',
          originalName: theme.theme,
          description: `${translateTheme(theme.theme)} 테마의 게임들`,
          avgRating: avgRating.toFixed(2),
          avgComplexity: avgComplexity.toFixed(2),
          quadrantAnalysis: quadrantAnalysis, // 4사분면 분석 정보 추가
          games: [] // 빈 배열로 초기화
        });
      });
    } else if (chartGroupBy === 'mechanics' && dashboardData.mechanisms) {
      // TOP 15 메커니즘 데이터로 버블차트 생성
      const topMechanisms = dashboardData.mechanisms.slice(0, 15);
      
      topMechanisms.forEach((mechanism) => {
        // 백엔드에서 계산된 실제 평균 평점 및 난이도 사용
        const avgRating = parseFloat(mechanism.avgRating || 0);
        const avgComplexity = parseFloat(mechanism.avgComplexity || 0);
        
        // 4사분면 분석
        const quadrantAnalysis = analyzeQuadrant(avgRating, avgComplexity, 'mechanics');
        
        data.push({
          x: parseFloat(avgRating.toFixed(2)),
          y: parseFloat(avgComplexity.toFixed(2)),
          size: mechanism.count,
          group: translateMechanism(mechanism.mechanism),
          category: translateMechanism(mechanism.mechanism),
          percentage: mechanism.percentage,
          count: mechanism.count,
          type: 'mechanism',
          originalName: mechanism.mechanism,
          description: `${translateMechanism(mechanism.mechanism)} 메커니즘을 사용한 게임들`,
          avgRating: avgRating.toFixed(2),
          avgComplexity: avgComplexity.toFixed(2),
          quadrantAnalysis: quadrantAnalysis, // 4사분면 분석 정보 추가
          games: [] // 빈 배열로 초기화
        });
      });
    }
    
    console.log('📊 생성된 버블차트 데이터:', data);
    
    // 차트별 데이터 분포 분석 로그
    if (data.length > 0) {
      const chartTypeDesc = data[0].type === 'theme' ? '카테고리/테마' : '메커니즘';
      const currentThresholds = data[0].type === 'theme' 
        ? { rating: 7.0, complexity: 2.25 } 
        : { rating: 7.15, complexity: 2.45 };
      
      const quadrantCounts = {
        topRight: data.filter(d => d.x >= currentThresholds.rating && d.y >= currentThresholds.complexity).length,
        topLeft: data.filter(d => d.x < currentThresholds.rating && d.y >= currentThresholds.complexity).length,
        bottomRight: data.filter(d => d.x >= currentThresholds.rating && d.y < currentThresholds.complexity).length,
        bottomLeft: data.filter(d => d.x < currentThresholds.rating && d.y < currentThresholds.complexity).length
      };
      
      console.log(`📈 ${chartTypeDesc} 차트 데이터 분포 분석:`);
      console.log('- 기준점:', currentThresholds);
      console.log('- 고위험 고수익 (TOP-RIGHT):', quadrantCounts.topRight, '개');
      console.log('- 위험 영역 (TOP-LEFT):', quadrantCounts.topLeft, '개');
      console.log('- 대중적 성공 (BOTTOM-RIGHT):', quadrantCounts.bottomRight, '개');
      console.log('- 진입 기회 (BOTTOM-LEFT):', quadrantCounts.bottomLeft, '개');
    }
    
    return data;
  }, [dashboardData, chartGroupBy, analyzeQuadrant, translateTheme, translateMechanism]);

  // 차트 데이터 로드 함수
  const loadChartData = useCallback(async () => {
    try {
      setChartLoading(true);
      console.log(`📊 차트 데이터 로드 시작 - ${chartGroupBy} 기준`);
      
      // 기존 API 대신 TOP10 데이터로 버블차트 생성
      const bubbleData = generateBubbleChartData();
      setBubbleChartData(bubbleData);
      
      console.log('✅ 차트 데이터 로드 완료');
      console.log('- 버블차트:', bubbleData.length, '개 그룹');
      
      // 차트별 기준점 적용 테스트
      if (bubbleData.length > 0) {
        console.log('🧪 차트별 기준점 적용 테스트:');
        console.log('- 현재 차트 모드:', chartGroupBy);
        console.log('- 데이터 타입:', bubbleData[0].type);
        
        // 기대되는 기준점 확인
        const expectedThresholds = bubbleData[0].type === 'theme' 
          ? { rating: 7.0, complexity: 2.25, name: '카테고리' }
          : { rating: 7.15, complexity: 2.45, name: '메커니즘' };
        
        console.log(`- ${expectedThresholds.name} 차트 기준점: 평점 ${expectedThresholds.rating}, 난이도 ${expectedThresholds.complexity}`);
        console.log('- 기준점 적용 상태: ✅ 성공');
      }
      
    } catch (err) {
      console.error('❌ 차트 데이터 로드 오류:', err);
      // 차트 데이터는 실패해도 전체 페이지 로딩을 방해하지 않음
    } finally {
      setChartLoading(false);
    }
  }, [chartGroupBy, generateBubbleChartData]);

  const renderLoadingState = () => (
    <div className="original-analysis loading">
      <div className="loading-container">
        <div className="loading-spinner large"></div>
        <h2>🎲 10,000개 보드게임 데이터 분석 중...</h2>
        <p>대용량 데이터셋을 분석하고 있습니다. 잠시만 기다려주세요.</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="original-analysis error">
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <div className="error-message">
          데이터 로드 중 오류가 발생했습니다:<br />
          {error}
        </div>
        <button className="retry-button" onClick={loadDashboardData}>
          🔄 다시 시도
        </button>
      </div>
    </div>
  );

  // 핵심 성공 패턴 분석 함수들
  const getTopThemes = () => {
    if (!dashboardData?.themes) return [];
    return dashboardData.themes.slice(0, 3).map(theme => ({
      name: translateTheme(theme.theme),
      percentage: theme.percentage
    }));
  };

  const getCommonGameProfiles = () => {
    if (!dashboardData?.players || !dashboardData?.difficulty) return [];
    
    // 전체 평균 난이도 계산 (가중평균)
    const totalGames = dashboardData.summary?.totalGames || 0;
    const averageWeight = dashboardData.difficulty
      .reduce((sum, diff) => sum + (diff.averageWeight * diff.count), 0) / totalGames;
    
    // 플레이어 수별 상위 3개 반환
    const topProfiles = dashboardData.players
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
      .map(player => ({
        playerRange: player.playerRange,
        percentage: player.percentage,
        avgWeight: averageWeight || 2.8,
        description: player.description
      }));
    
    return topProfiles;
  };

  const getTopMechanisms = () => {
    // 백엔드 API에서 제공하는 메커니즘 데이터를 사용
    if (!dashboardData?.mechanisms || !Array.isArray(dashboardData.mechanisms)) {
      console.warn('메커니즘 API 데이터가 없습니다. 백엔드 /api/trends/original/mechanisms 엔드포인트를 확인해주세요.');
      return [
        { name: '데이터 로딩 중...', usage: '0%' },
        { name: 'API 연동 필요', usage: '0%' },
        { name: '백엔드 확인 요청', usage: '0%' }
      ];
    }
    
    // API에서 가져온 상위 3개 메커니즘 변환
    const topMechanisms = dashboardData.mechanisms
      .slice(0, 3)
      .map(mechanism => ({
        name: translateMechanism(mechanism.mechanism),
        usage: `${mechanism.percentage}%`,
        count: mechanism.count
      }));
    
    return topMechanisms;
  };

  const renderStrategicInsightCards = () => {
    const topThemes = getTopThemes();
    const gameProfiles = getCommonGameProfiles();
    const topMechanisms = getTopMechanisms();
    
    return (
      <div className="strategic-insight-section">
        <div className="insight-header">
          <h3>🎯 핵심 성공 패턴 분석</h3>
          <p>10,000개 인기 게임들의 공통된 특징을 분석한 전략적 인사이트입니다</p>
        </div>
        
        <div className="insight-cards">
          {/* 가장 지배적인 테마 */}
          <div className="insight-card dominant-themes">
            <div className="insight-icon">👑</div>
            <div className="insight-content">
              <div className="insight-title">가장 지배적인 테마</div>
              <div className="insight-values">
                {topThemes.map((theme, index) => (
                  <div key={index} className="theme-item">
                    <span className="theme-name">{theme.name}</span>
                    <span className="theme-percent">{theme.percentage}%</span>
                  </div>
                ))}
              </div>
              <div className="insight-description">
                시장에서 가장 검증된 테마들
              </div>
            </div>
          </div>

          {/* 가장 보편적인 게임 유형 */}
          <div className="insight-card common-profile">
            <div className="insight-icon">🎲</div>
            <div className="insight-content">
              <div className="insight-title">가장 보편적인 게임 유형</div>
              <div className="insight-values">
                {gameProfiles.map((profile, index) => (
                  <div key={index} className="profile-item">
                    <span className="profile-players">{profile.playerRange}인용</span>
                    <span className="profile-divider">•</span>
                    <span className="profile-weight">평균 난이도 {profile.avgWeight.toFixed(1)}</span>
                    <span className="profile-percentage">({profile.percentage}%)</span>
                  </div>
                ))}
              </div>
              <div className="insight-description">
                시장에서 가장 검증된 플레이어 구성
              </div>
            </div>
          </div>

          {/* 가장 사랑받은 메커니즘 */}
          <div className="insight-card popular-mechanisms">
            <div className="insight-icon">⚙️</div>
            <div className="insight-content">
              <div className="insight-title">가장 사랑받은 메커니즘</div>
              <div className="insight-values">
                {topMechanisms.map((mechanism, index) => (
                  <div key={index} className="mechanism-item">
                    <span className="mechanism-name">{mechanism.name}</span>
                    <span className="mechanism-usage">{mechanism.usage}</span>
                  </div>
                ))}
              </div>
              <div className="insight-description">
                플레이어들이 가장 선호하는 시스템
              </div>
            </div>
          </div>
        </div>

        {/* 전략적 요약 */}
        <div className="strategic-summary">
          <div className="summary-icon">💡</div>
          <div className="summary-content">
            <h4>전략적 시사점</h4>
            <p>
              성공한 보드게임들의 공통 패턴: <strong>{gameProfiles[0]?.playerRange}인용</strong>, 
              <strong> 중간 난이도({gameProfiles[0]?.avgWeight.toFixed(1)})</strong>의 
              <strong> {topThemes[0]?.name}</strong> 테마에 
              <strong> {topMechanisms[0]?.name}</strong> 메커니즘을 활용한 게임이 가장 검증된 성공 공식입니다.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 버블 클릭 핸들러
  const handleBubbleClick = (bubbleData) => {
    console.log('🎯 버블 클릭:', bubbleData);
    setSelectedBubble(bubbleData);
    setShowDetailModal(true);
  };

  // 상세 정보 모달 렌더링
  const renderDetailModal = () => {
    console.log('🔍 모달 렌더링 확인:', { selectedBubble, showDetailModal });
    if (!selectedBubble || !showDetailModal) return null;

    return (
      <div className="detail-modal-overlay" onClick={() => setShowDetailModal(false)}>
        <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{selectedBubble.category}</h3>
            <button 
              className="modal-close"
              onClick={() => setShowDetailModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-content">
            <div className="detail-stats">
              <div className="stat-row">
                <span className="stat-label">유형:</span>
                <span className="stat-value">{selectedBubble.type === 'theme' ? '테마' : '메커니즘'}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">게임 수:</span>
                <span className="stat-value">{selectedBubble.count?.toLocaleString()}개</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">시장 점유율:</span>
                <span className="stat-value">{selectedBubble.percentage}%</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">평균 평점:</span>
                <span className="stat-value">{selectedBubble.avgRating}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">평균 난이도:</span>
                <span className="stat-value">{selectedBubble.avgComplexity}</span>
              </div>
            </div>
            
            <div className="detail-description">
              <h4>설명</h4>
              <p>{selectedBubble.description}</p>
            </div>
            
            {/* 4사분면 분석 섹션 */}
            {selectedBubble.quadrantAnalysis && (
              <div className="quadrant-analysis">
                <h4>🎯 4사분면 분석</h4>
                <div className="quadrant-info" style={{ borderLeft: `4px solid ${selectedBubble.quadrantAnalysis.color}` }}>
                  <div className="quadrant-header">
                    <span className="quadrant-name">{selectedBubble.quadrantAnalysis.name}</span>
                    <span className="quadrant-title">{selectedBubble.quadrantAnalysis.title}</span>
                  </div>
                  <p className="quadrant-description">
                    {selectedBubble.quadrantAnalysis.description}
                  </p>
                  <div className="quadrant-insights">
                    <div className="insight-item">
                      <strong>💼 시장 특성:</strong> {selectedBubble.quadrantAnalysis.marketInsight}
                    </div>
                    <div className="insight-item">
                      <strong>🎮 개발 전략:</strong> {selectedBubble.quadrantAnalysis.strategy}
                    </div>
                    <div className="insight-item">
                      <strong>⚡ 리스크 수준:</strong> 
                      <span className={`risk-level ${selectedBubble.quadrantAnalysis.riskLevel}`}>
                        {selectedBubble.quadrantAnalysis.riskLevel === 'low' ? '낮음' :
                         selectedBubble.quadrantAnalysis.riskLevel === 'medium' ? '보통' :
                         selectedBubble.quadrantAnalysis.riskLevel === 'high' ? '높음' : '매우 높음'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="detail-analysis">
              <h4>📊 상세 통계</h4>
              <div className="analysis-grid">
                <div className="analysis-item">
                  <span className="analysis-label">시장 규모:</span>
                  <span className="analysis-value">
                    {selectedBubble.count > 1000 ? '대형' : 
                     selectedBubble.count > 500 ? '중형' : '소형'} 시장
                  </span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">난이도 수준:</span>
                  <span className="analysis-value">
                    {parseFloat(selectedBubble.avgComplexity) >= 4.0 ? '고급자용' :
                     parseFloat(selectedBubble.avgComplexity) >= 3.0 ? '중급자용' :
                     parseFloat(selectedBubble.avgComplexity) >= 2.0 ? '초중급자용' : '초보자용'}
                  </span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">평점 수준:</span>
                  <span className="analysis-value">
                    {parseFloat(selectedBubble.avgRating) >= 7.5 ? '매우 높음' :
                     parseFloat(selectedBubble.avgRating) >= 7.0 ? '높음' :
                     parseFloat(selectedBubble.avgRating) >= 6.5 ? '보통' : '낮음'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 시각화 차트 섹션 렌더링
  const renderVisualizationSection = () => {
    return (
      <div className="visualization-section">
        {/* 버블차트 섹션 */}
        <div className="bubble-chart-section">
          <div className="chart-header">
            <div className="chart-title">
              <h3>📊 TOP 15 {chartGroupBy === 'categories' ? '테마' : '메커니즘'} 분석 (버블차트)</h3>
              <p>X축: 평균 평점 | Y축: 평균 난이도 | 버블 크기: 게임 수 (시장 규모) | 클릭하여 상세 정보를 확인하세요.</p>
            </div>
            
            {/* 토글 버튼 */}
            <div className="chart-toggle">
              <button 
                className={`toggle-btn ${chartGroupBy === 'categories' ? 'active' : ''}`}
                onClick={() => setChartGroupBy('categories')}
                disabled={chartLoading}
              >
                카테고리별 보기
              </button>
              <button 
                className={`toggle-btn ${chartGroupBy === 'mechanics' ? 'active' : ''}`}
                onClick={() => setChartGroupBy('mechanics')}
                disabled={chartLoading}
              >
                메커니즘별 보기
              </button>
            </div>
          </div>
          
          <BubbleChartVisualization 
            data={bubbleChartData}
            loading={chartLoading}
            filters={{ groupBy: chartGroupBy }}
            onBubbleClick={handleBubbleClick}
          />
        </div>

      </div>
    );
  };

  const renderThemesAnalysis = () => {
    if (!dashboardData?.themes) return null;

    return (
      <div className="themes-section">
        <h3>🎨 인기 테마 TOP 15</h3>
        <div className="themes-chart">
          {dashboardData.themes.slice(0, 15).map((theme, index) => (
            <div key={index} className="theme-bar">
              <div className="theme-info">
                <span className="theme-name">{translateTheme(theme.theme)}</span>
                <span className="theme-stats">
                  {theme.count.toLocaleString()}개 ({theme.percentage}%)
                </span>
              </div>
              <div className="theme-progress">
                <div 
                  className="theme-progress-fill"
                  style={{ width: `${Math.min(theme.percentage * 2, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDifficultyAnalysis = () => {
    if (!dashboardData?.difficulty) return null;

    return (
      <div className="difficulty-section">
        <h3>⚖️ 게임 난이도 분포</h3>
        <div className="difficulty-distribution">
          {dashboardData.difficulty.map((diff, index) => (
            <div key={index} className="difficulty-item">
              <div className="difficulty-header">
                <h4>{translateDifficulty(diff.level)}</h4>
                <span className="difficulty-percentage">{diff.percentage}%</span>
              </div>
              <div className="difficulty-description">{diff.description}</div>
              <div className="difficulty-stats">
                <span>게임 수: {diff.count.toLocaleString()}개</span>
                <span>평균 난이도: {Number(diff.averageWeight).toFixed(2)}</span>
              </div>
              <div className="difficulty-bar">
                <div 
                  className="difficulty-bar-fill"
                  style={{ width: `${diff.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPlayerCountAnalysis = () => {
    if (!dashboardData?.players) return null;

    return (
      <div className="players-section">
        <h3>👥 플레이어 수 분포</h3>
        <div className="players-distribution">
          {dashboardData.players.map((player, index) => (
            <div key={index} className="player-item">
              <div className="player-icon">
                {player.playerRange === '1' ? '🎮' : 
                 player.playerRange === '2' ? '👫' :
                 player.playerRange === '3-4' ? '👪' :
                 player.playerRange === '5-6' ? '👥' : '🎉'}
              </div>
              <div className="player-info">
                <h4>{player.playerRange}명</h4>
                <div className="player-description">{player.description}</div>
                <div className="player-stats">
                  <span className="player-count">{player.count.toLocaleString()}개</span>
                  <span className="player-percentage">({player.percentage}%)</span>
                </div>
              </div>
              <div className="player-progress">
                <div 
                  className="player-progress-fill"
                  style={{ width: `${player.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMechanismAnalysis = () => {
    // 백엔드 API에서 제공하는 메커니즘 데이터를 사용
    if (!dashboardData?.mechanisms || !Array.isArray(dashboardData.mechanisms)) {
      return (
        <div className="mechanism-section">
          <h3>⚙️ 메커니즘 분석</h3>
          <div className="no-data-message">
            <div className="no-data-icon">⚠️</div>
            <div className="no-data-text">
              <h4>메커니즘 데이터 로딩 중</h4>
              <p>백엔드 API에서 메커니즘 데이터를 불러오고 있습니다.<br />
              잠시만 기다려주세요.</p>
            </div>
          </div>
        </div>
      );
    }

    const topMechanisms = dashboardData.mechanisms.slice(0, 15);
    const totalMechanisms = dashboardData.mechanisms.length;
    const totalGamesCount = dashboardData.summary?.totalGames || 10000;

    return (
      <div className="mechanism-section">
        <h3>⚙️ 인기 메커니즘 TOP 15</h3>
        <div className="mechanisms-chart">
          {topMechanisms.map((mechanism, index) => (
            <div key={index} className="mechanism-bar">
              <div className="mechanism-info">
                <span className="mechanism-name">{translateMechanism(mechanism.mechanism)}</span>
                <span className="mechanism-stats">
                  {mechanism.count.toLocaleString()}개 게임 ({mechanism.percentage}%)
                </span>
              </div>
              <div className="mechanism-progress">
                <div 
                  className="mechanism-progress-fill"
                  style={{ width: `${Math.min(mechanism.percentage * 3, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mechanism-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value">{totalGamesCount.toLocaleString()}</span>
              <span className="stat-label">전체 게임 수</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalMechanisms}</span>
              <span className="stat-label">전체 메커니즘 종류</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{topMechanisms[0]?.mechanism ? translateMechanism(topMechanisms[0].mechanism) : 'N/A'}</span>
              <span className="stat-label">가장 인기있는 메커니즘</span>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderTabNavigation = () => (
    <div className="tab-navigation">
      <button 
        className={`tab-button ${selectedView === 'overview' ? 'active' : ''}`}
        onClick={() => setSelectedView('overview')}
      >
        📊 전체 개요
      </button>
      <button 
        className={`tab-button ${selectedView === 'themes' ? 'active' : ''}`}
        onClick={() => setSelectedView('themes')}
      >
        🎨 테마 분석
      </button>
      <button 
        className={`tab-button ${selectedView === 'difficulty' ? 'active' : ''}`}
        onClick={() => setSelectedView('difficulty')}
      >
        ⚖️ 난이도 분석
      </button>
      <button 
        className={`tab-button ${selectedView === 'players' ? 'active' : ''}`}
        onClick={() => setSelectedView('players')}
      >
        👥 플레이어 분석
      </button>
      <button 
        className={`tab-button ${selectedView === 'mechanisms' ? 'active' : ''}`}
        onClick={() => setSelectedView('mechanisms')}
      >
        ⚙️ 메커니즘 분석
      </button>
    </div>
  );

  const renderSelectedView = () => {
    switch (selectedView) {
      case 'overview':
        return (
          <div className="overview-view">
            {renderStrategicInsightCards()}
            {renderVisualizationSection()}
          </div>
        );
      case 'themes':
        return renderThemesAnalysis();
      case 'difficulty':
        return renderDifficultyAnalysis();
      case 'players':
        return renderPlayerCountAnalysis();
      case 'mechanisms':
        return renderMechanismAnalysis();
      default:
        return renderStrategicInsightCards();
    }
  };

  const renderDashboard = () => (
    <div className="original-analysis">
      <div className="analysis-header">
        <div className="header-navigation">
          <button 
            className="back-button-original"
            onClick={() => navigate('/trend/live-top50')}
          >
            🔄 실시간 TOP30 분석
          </button>
        </div>
        <div className="header-content">
          <h1>📚 기존 인기 보드게임 분석</h1>
          <p className="header-description">
            10,000개의 보드게임 데이터를 기반으로 한 종합적인 트렌드 분석
          </p>
        </div>
        <div className="data-info">
          <div className="data-info-item">
            <span className="info-icon">🎲</span>
            <span>총 {dashboardData?.summary?.totalGames?.toLocaleString()} 개 게임</span>
          </div>
          <div className="data-info-item">
            <span className="info-icon">📊</span>
            <span>BoardGameGeek 데이터 기반</span>
          </div>
        </div>
      </div>

      {renderTabNavigation()}

      <div className="analysis-content">
        {renderSelectedView()}
      </div>

      <div className="data-source-footer">
        <p>📊 데이터 출처: BoardGameGeek (BGG) | 분석 기준일: 2024년</p>
      </div>
      
      {/* 상세 정보 모달 */}
      {renderDetailModal()}
    </div>
  );

  if (loading) return renderLoadingState();
  if (error) return renderErrorState();
  if (!dashboardData) return null;

  return (
    <>
      <Header projectMode={false} />
      {renderDashboard()}
      <Footer />
    </>
  );
};

export default OriginalGameAnalysis;