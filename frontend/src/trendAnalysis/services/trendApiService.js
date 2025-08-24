import axios from 'axios';

// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
const trendApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 트렌드 분석은 시간이 오래 걸릴 수 있음
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 인증 토큰 추가
trendApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔥 API 호출: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
trendApiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답 성공: ${response.config.url} (${response.status})`);
    console.log(`📊 응답 데이터:`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ API 응답 실패: ${error.config?.url} (${error.response?.status || 'Network Error'})`);
    console.error(`🔍 에러 상세:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // BGG API 레이트 리밋 감지
    if (error.response?.status === 429 || error.message?.includes('Rate limit')) {
      error.message = 'BGG API 요청 한도 초과. 잠시 후 다시 시도해주세요.';
    }
    
    // 서버 연결 오류 감지
    if (!error.response) {
      if (error.code === 'ECONNREFUSED') {
        error.message = '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
      } else if (error.code === 'ENOTFOUND') {
        error.message = '서버 주소를 찾을 수 없습니다. 네트워크 연결을 확인해주세요.';
      } else if (error.code === 'ETIMEDOUT') {
        error.message = '서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
      }
    }
    
    // 인증 에러 처리
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // 필요시 로그인 페이지로 리다이렉트
      // window.location.href = '/login';
    }
    
    // 에러 메시지 정규화
    const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다';
    error.message = errorMessage;
    
    return Promise.reject(error);
  }
);

// ========== ORIGINAL 도메인 API (10K 데이터셋 기반) ==========

/**
 * 기존 데이터셋 기반 대시보드 데이터 조회 (구버전 - 호환성 유지)
 * @returns {Promise<Object>} 대시보드 데이터 (테마, 난이도, 플레이어 수 분포)
 */
export const fetchOriginalDashboard = async () => {
  try {
    const response = await trendApiClient.get('/api/trends/original/full-dashboard');
    return response.data.data || response.data;
  } catch (error) {
    console.error('기존 데이터셋 대시보드 조회 실패:', error);
    throw new Error(`대시보드 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 전체 통합 대시보드 데이터 조회 (신규 - 모든 분석 데이터 포함)
 * @returns {Promise<Object>} 통합 대시보드 데이터
 */
export const fetchOriginalFullDashboard = async () => {
  try {
    console.log('📊 전체 통합 대시보드 데이터 조회 시작...');
    const response = await trendApiClient.get('/api/trends/original/full-dashboard');
    console.log('✅ 전체 통합 대시보드 데이터 조회 완료');
    return response.data.data || response.data;
  } catch (error) {
    console.error('전체 통합 대시보드 조회 실패:', error);
    throw new Error(`전체 대시보드 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 평점 분포 조회 (10K 데이터셋)
 * @returns {Promise<Array>} 평점 분포 데이터
 */
export const fetchOriginalRatings = async () => {
  try {
    const response = await trendApiClient.get('/api/trends/original/ratings');
    return response.data.data || response.data;
  } catch (error) {
    console.error('평점 분포 조회 실패:', error);
    throw new Error(`평점 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 연도별 게임 분포 조회 (10K 데이터셋)
 * @returns {Promise<Array>} 연도별 게임 분포 데이터
 */
export const fetchOriginalYearly = async () => {
  try {
    const response = await trendApiClient.get('/api/trends/original/yearly');
    return response.data.data || response.data;
  } catch (error) {
    console.error('연도별 게임 분포 조회 실패:', error);
    throw new Error(`연도별 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 상위 평점 게임 조회 (10K 데이터셋)
 * @param {number} limit - 조회할 게임 수 (기본값: 10, 최대: 50)
 * @returns {Promise<Array>} 상위 평점 게임 목록
 */
export const fetchOriginalTopGames = async (limit = 10) => {
  try {
    const response = await trendApiClient.get(`/api/trends/original/top-games?limit=${limit}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('상위 평점 게임 조회 실패:', error);
    throw new Error(`상위 평점 게임 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 대시보드 요약 통계 조회 (10K 데이터셋)
 * @returns {Promise<Object>} 요약 통계 데이터
 */
export const fetchOriginalSummary = async () => {
  try {
    const response = await trendApiClient.get('/api/trends/original/summary');
    return response.data.data || response.data;
  } catch (error) {
    console.error('요약 통계 조회 실패:', error);
    throw new Error(`요약 통계 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 인기 테마 조회 (10K 데이터셋)
 * @returns {Promise<Array>} 인기 테마 목록
 */
export const fetchOriginalThemes = async () => {
  try {
    const response = await trendApiClient.get('/api/trends/original/themes');
    return response.data.data || response.data;
  } catch (error) {
    console.error('인기 테마 조회 실패:', error);
    throw new Error(`테마 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 인기 메커니즘 조회 (10K 데이터셋)
 * @returns {Promise<Array>} 인기 메커니즘 목록
 */
export const fetchOriginalMechanisms = async () => {
  try {
    const response = await trendApiClient.get('/api/trends/original/mechanisms');
    return response.data.data || response.data;
  } catch (error) {
    console.error('인기 메커니즘 조회 실패:', error);
    throw new Error(`메커니즘 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 난이도 분포 조회 (10K 데이터셋)
 * @returns {Promise<Array>} 난이도 분포 데이터
 */
export const fetchOriginalDifficulty = async () => {
  try {
    const response = await trendApiClient.get('/api/trends/original/difficulty');
    return response.data.data || response.data;
  } catch (error) {
    console.error('난이도 분포 조회 실패:', error);
    throw new Error(`난이도 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 플레이어 수 분포 조회 (10K 데이터셋)
 * @returns {Promise<Array>} 플레이어 수 분포 데이터
 */
export const fetchOriginalPlayerCount = async () => {
  try {
    const response = await trendApiClient.get('/api/trends/original/players');
    return response.data.data || response.data;
  } catch (error) {
    console.error('플레이어 수 분포 조회 실패:', error);
    throw new Error(`플레이어 수 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 시스템 헬스 체크 (10K 데이터셋)
 * @returns {Promise<Object>} 헬스 상태 정보
 */
export const fetchOriginalHealth = async () => {
  try {
    const response = await trendApiClient.get('/api/trends/original/health');
    return response.data.data || response.data;
  } catch (error) {
    console.error('헬스 체크 실패:', error);
    throw new Error(`헬스 체크 실패: ${error.message}`);
  }
};

// ========== LIVE 도메인 API (BGG 실시간) ==========

/**
 * BGG 실시간 TOP 50 게임 조회
 * @returns {Promise<Object>} TOP 50 게임 목록 및 트렌드 요약
 */
export const fetchLiveTop50 = async () => {
  try {
    console.log('🔥 BGG 실시간 TOP 50 조회 시작...');
    const response = await trendApiClient.get('/api/trends/live/top50');
    console.log('✅ BGG TOP 50 데이터 조회 완료');
    return response.data.data || response.data;
  } catch (error) {
    console.error('실시간 TOP 50 조회 실패:', error);
    throw new Error(`실시간 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * BGG Hot Games 조회
 * @returns {Promise<Object>} 현재 인기 게임 목록
 */
export const fetchLiveHotGames = async () => {
  try {
    const response = await trendApiClient.get('/api/trends/live/hot-games');
    return response.data.data || response.data;
  } catch (error) {
    console.error('BGG Hot Games 조회 실패:', error);
    throw new Error(`Hot Games 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 배치 게임 상세 정보 조회 (BGG API) - 성능 최적화
 * @param {Array<string|number>} gameIds - BGG 게임 ID 목록
 * @returns {Promise<Object>} 배치 게임 상세 정보
 */
export const fetchLiveGameDetailsBatch = async (gameIds) => {
  try {
    console.log('🚀 배치 게임 상세 정보 조회 시작:', gameIds.length, '개 게임');
    const response = await trendApiClient.post('/api/trends/live/game-details-batch', {
      gameIds: gameIds.map(id => String(id))
    });
    console.log('✅ 배치 게임 상세 정보 조회 완료');
    return response.data.data || response.data;
  } catch (error) {
    console.error('배치 게임 상세 정보 조회 실패:', error);
    throw new Error(`배치 게임 상세 정보 로딩 실패: ${error.message}`);
  }
};

/**
 * 게임 번역 API 호출
 */
export const translateGame = async (gameId) => {
  try {
    console.log('🔤 게임 번역 시작:', gameId);
    const response = await trendApiClient.post(`/api/trends/live/translate-game/${gameId}`);
    console.log('✅ 게임 번역 완료:', gameId);
    return response.data.data || response.data;
  } catch (error) {
    console.error('게임 번역 실패:', gameId, error);
    throw new Error(`게임 번역 실패: ${error.message}`);
  }
};

/**
 * 번역 서비스 상태 확인
 */
export const checkTranslationHealth = async () => {
  try {
    const response = await trendApiClient.get('/api/trends/live/translation-health');
    return response.data;
  } catch (error) {
    console.error('번역 서비스 상태 확인 실패:', error);
    return { status: 'error', error: error.message };
  }
};

/**
 * TOP 30 전체 게임 번역 API 호출
 */
export const translateAllGames = async (games) => {
  try {
    console.log('🔤 TOP 30 전체 게임 번역 시작:', games.length, '개 게임');
    console.log('예상 소요 시간: 약 10-15초 (최적화된 배치 처리)');
    console.log('요청할 데이터:', { games: games.slice(0, 1) }); // 첫 번째 게임만 로깅
    
    // 전체 번역용 특별 타임아웃 설정 (5분)
    const response = await trendApiClient.post('/api/trends/live/translate-all-games', {
      games: games
    }, {
      timeout: 300000 // 5분 (300초)
    });
    
    console.log('✅ API 응답 받음:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data.data || response.data;
  } catch (error) {
    console.error('TOP 30 전체 게임 번역 실패:', error);
    console.error('에러 상세:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // 타임아웃 에러에 대한 친화적 메시지
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      throw new Error('번역 작업이 예상보다 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.');
    }
    
    throw new Error(`전체 게임 번역 실패: ${error.message}`);
  }
};

/**
 * 개별 게임 상세 정보 조회 (BGG API) - 기존 API 유지
 * @param {string|number} gameId - BGG 게임 ID
 * @returns {Promise<Object>} 게임 상세 정보
 */
export const fetchLiveGameDetail = async (gameId) => {
  try {
    console.log('🎲 게임 상세 정보 조회 시작:', gameId);
    const response = await trendApiClient.get(`/api/trends/live/game-detail/${gameId}`);
    console.log('✅ 게임 상세 정보 조회 완료');
    return response.data.data || response.data;
  } catch (error) {
    console.error('게임 상세 정보 조회 실패:', error);
    throw new Error(`게임 상세 정보 로딩 실패: ${error.message}`);
  }
};

// ========== 유틸리티 함수 ==========

/**
 * 모든 기존 데이터셋 정보를 한 번에 조회
 * @returns {Promise<Object>} 통합된 대시보드 데이터
 */
export const fetchAllOriginalData = async () => {
  try {
    console.log('📊 기존 데이터셋 전체 조회 시작...');
    
    const [dashboard, health] = await Promise.all([
      fetchOriginalDashboard(),
      fetchOriginalHealth()
    ]);
    
    console.log('✅ 기존 데이터셋 전체 조회 완료');
    
    return {
      dashboard,
      health,
      source: '10K 데이터셋',
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('기존 데이터셋 통합 조회 실패:', error);
    throw error;
  }
};

/**
 * BGG API 상태 체크
 * @returns {Promise<boolean>} API 사용 가능 여부
 */
export const checkBggApiStatus = async () => {
  try {
    // 가벼운 요청으로 BGG API 상태 확인
    const response = await trendApiClient.get('/api/trends/live/hot-games', { 
      timeout: 10000 
    });
    return response.status === 200;
  } catch (error) {
    console.warn('BGG API 상태 확인 실패:', error.message);
    return false;
  }
};

/**
 * API 상태 종합 체크
 * @returns {Promise<Object>} 전체 API 상태 정보
 */
export const getApiHealthStatus = async () => {
  try {
    const [originalHealth, bggStatus] = await Promise.all([
      fetchOriginalHealth().catch(() => ({ status: 'unhealthy', error: '기존 데이터셋 연결 실패' })),
      checkBggApiStatus().catch(() => false)
    ]);
    
    return {
      original: originalHealth,
      bgg: {
        status: bggStatus ? 'healthy' : 'unavailable',
        available: bggStatus
      },
      overall: originalHealth.status === 'healthy' && bggStatus ? 'healthy' : 'partial',
      lastChecked: new Date()
    };
  } catch (error) {
    console.error('API 상태 체크 실패:', error);
    return {
      original: { status: 'unknown' },
      bgg: { status: 'unknown', available: false },
      overall: 'unknown',
      error: error.message,
      lastChecked: new Date()
    };
  }
};

/**
 * 에러 메시지 사용자 친화적으로 변환
 * @param {Error} error - 에러 객체
 * @returns {string} 사용자 친화적 에러 메시지
 */
export const formatTrendApiError = (error) => {
  if (!error) return '알 수 없는 오류가 발생했습니다.';
  
  // BGG API 레이트 리밋
  if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
    return '🚫 BGG API 요청 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.';
  }
  
  // 네트워크 오류
  if (error.message?.includes('Network Error') || error.message?.includes('timeout')) {
    return '🌐 네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
  }
  
  // BGG API 서버 오류
  if (error.message?.includes('BGG') && (error.message?.includes('500') || error.message?.includes('503'))) {
    return '🏠 BoardGameGeek 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
  }
  
  // 데이터베이스 오류
  if (error.message?.includes('데이터셋') || error.message?.includes('database')) {
    return '💾 데이터베이스 연결에 문제가 있습니다. 관리자에게 문의해주세요.';
  }
  
  return error.message || '알 수 없는 오류가 발생했습니다.';
};

// ========== INTERACTIVE 도메인 API (10K 데이터셋 인터랙티브 분석) ==========

/**
 * 인터랙티브 게임 필터링 API (백엔드 API 업데이트 대응)
 * @param {Object} filters - 필터 조건
 * @param {number} filters.complexityMin - 최소 난이도 (기본값: 1.0)
 * @param {number} filters.complexityMax - 최대 난이도 (기본값: 5.0)
 * @param {Array<number>} filters.players - 플레이어 수 배열
 * @param {Array<string>} filters.categories - 카테고리 배열
 * @param {Array<string>} filters.mechanics - 메카닉 배열
 * @param {number} filters.limit - 결과 제한 (기본값: 500, 최대: 2000)
 * @param {string} filters.sortBy - 정렬 기준 (기본값: 'geek_rating')
 * @param {string} filters.sortOrder - 정렬 순서 (기본값: 'desc')
 * @returns {Promise<Array>} 필터링된 게임 목록
 */
export const fetchInteractiveFilteredGames = async (filters = {}) => {
  try {
    const {
      complexityMin = 1.0,
      complexityMax = 5.0,
      players = [],
      categories = [],
      mechanics = [],
      limit = 500,
      sortBy = 'geek_rating',
      sortOrder = 'desc'
    } = filters;
    
    console.log('🔍 인터랙티브 게임 필터링 시작:', filters);
    console.log('📝 구성된 파라미터:', {
      complexityMin, complexityMax, players, categories, mechanics, 
      limit: Math.min(limit, 2000), sortBy, sortOrder
    });
    
    // 쿼리 파라미터 구성
    const params = new URLSearchParams();
    params.append('complexityMin', complexityMin.toString());
    params.append('complexityMax', complexityMax.toString());
    params.append('limit', Math.min(limit, 2000).toString()); // 최대 2000개 제한
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    
    if (players.length > 0) {
      params.append('players', players.join(','));
    }
    if (categories.length > 0) {
      params.append('categories', categories.join(','));
    }
    if (mechanics.length > 0) {
      params.append('mechanics', mechanics.join(','));
    }
    
    const url = `/api/trends/interactive/filter?${params.toString()}`;
    console.log('🌐 최종 API URL:', url);
    
    const response = await trendApiClient.get(url);
    console.log('✅ 인터랙티브 게임 필터링 완료:', response.data.data?.length || 0, '개 게임');
    console.log(`📊 정렬: ${sortBy} ${sortOrder}, 제한: ${Math.min(limit, 2000)}개`);
    
    return response.data.data || response.data;
  } catch (error) {
    console.error('인터랙티브 게임 필터링 실패:', error);
    throw new Error(`게임 필터링 실패: ${error.message}`);
  }
};

/**
 * 버블 차트용 집계 데이터 조회 API
 * @param {Object} options - 버블 차트 옵션
 * @param {string} options.groupBy - 그룹화 기준 ('categories' 또는 'mechanics')
 * @param {number} options.complexityMin - 최소 난이도
 * @param {number} options.complexityMax - 최대 난이도
 * @param {Array<number>} options.players - 플레이어 수 필터
 * @param {Array<string>} options.categories - 카테고리 필터 (필터링된 게임과 동일)
 * @param {Array<string>} options.mechanics - 메카닉 필터 (필터링된 게임과 동일)
 * @param {number} options.limit - 게임 수 제한 (필터링된 게임과 동일)
 * @returns {Promise<Array>} 버블 차트 데이터
 */
export const fetchInteractiveBubbleChart = async (options = {}) => {
  try {
    const {
      groupBy = 'categories',
      complexityMin = 1.0,
      complexityMax = 5.0,
      players = [],
      categories = [],
      mechanics = [],
      limit = 500
    } = options;
    
    console.log('🫧 버블 차트 데이터 조회 시작 (필터링된 게임과 동일한 조건):', options);
    
    const params = new URLSearchParams();
    params.append('groupBy', groupBy);
    params.append('complexityMin', complexityMin.toString());
    params.append('complexityMax', complexityMax.toString());
    params.append('limit', limit.toString());
    
    if (players.length > 0) {
      params.append('players', players.join(','));
    }
    if (categories.length > 0) {
      params.append('categories', categories.join(','));
    }
    if (mechanics.length > 0) {
      params.append('mechanics', mechanics.join(','));
    }
    
    const response = await trendApiClient.get(`/api/trends/interactive/bubble-chart?${params.toString()}`);
    console.log('✅ 버블 차트 데이터 조회 완료:', response.data.data?.length || 0, '개 그룹 (동일 필터 조건)');
    
    return response.data.data || response.data;
  } catch (error) {
    console.error('버블 차트 데이터 조회 실패:', error);
    throw new Error(`버블 차트 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 히트맵용 집계 데이터 조회 API
 * @param {Object} filters - 히트맵 필터 (필터링된 게임과 동일한 조건 사용)
 * @param {number} filters.complexityMin - 최소 난이도
 * @param {number} filters.complexityMax - 최대 난이도
 * @param {Array<number>} filters.players - 플레이어 수 필터
 * @param {Array<string>} filters.categories - 카테고리 필터
 * @param {Array<string>} filters.mechanics - 메카닉 필터
 * @param {number} filters.limit - 게임 수 제한
 * @returns {Promise<Array>} 히트맵 데이터
 */
export const fetchInteractiveHeatmap = async (filters = {}) => {
  try {
    const { 
      complexityMin = 1.0, 
      complexityMax = 5.0,
      players = [],
      categories = [], 
      mechanics = [],
      limit = 500
    } = filters;
    
    console.log('🌡️ 히트맵 데이터 조회 시작 (필터링된 게임과 동일한 조건):', filters);
    
    const params = new URLSearchParams();
    params.append('complexityMin', complexityMin.toString());
    params.append('complexityMax', complexityMax.toString());
    params.append('limit', limit.toString());
    
    if (players.length > 0) {
      params.append('players', players.join(','));
    }
    if (categories.length > 0) {
      params.append('categories', categories.join(','));
    }
    if (mechanics.length > 0) {
      params.append('mechanics', mechanics.join(','));
    }
    
    const response = await trendApiClient.get(`/api/trends/interactive/heatmap?${params.toString()}`);
    console.log('✅ 히트맵 데이터 조회 완료:', response.data.data?.length || 0, '개 셀 (동일 필터 조건)');
    
    return response.data.data || response.data;
  } catch (error) {
    console.error('히트맵 데이터 조회 실패:', error);
    throw new Error(`히트맵 데이터 로딩 실패: ${error.message}`);
  }
};

/**
 * 전체 카테고리 목록 조회 API (자동완성용)
 * @returns {Promise<Array>} 카테고리 목록
 */
export const fetchInteractiveCategories = async () => {
  try {
    console.log('📂 전체 카테고리 목록 조회 시작...');
    
    const response = await trendApiClient.get('/api/trends/interactive/categories');
    console.log('✅ 전체 카테고리 목록 조회 완료:', response.data.data?.length || 0, '개 카테고리');
    
    return response.data.data || response.data;
  } catch (error) {
    console.error('카테고리 목록 조회 실패:', error);
    throw new Error(`카테고리 목록 로딩 실패: ${error.message}`);
  }
};

/**
 * 인기 카테고리 목록 조회 API (필터링용 상위 25개)
 * @returns {Promise<Array>} 인기 카테고리 목록
 */
export const fetchInteractivePopularCategories = async () => {
  try {
    console.log('📂 인기 카테고리 목록 조회 시작...');
    
    const response = await trendApiClient.get('/api/trends/interactive/categories/popular');
    console.log('✅ 인기 카테고리 목록 조회 완료:', response.data.data?.length || 0, '개 인기 카테고리');
    
    return response.data.data || response.data;
  } catch (error) {
    console.error('인기 카테고리 목록 조회 실패:', error);
    throw new Error(`인기 카테고리 목록 로딩 실패: ${error.message}`);
  }
};

/**
 * 전체 메카닉 목록 조회 API (자동완성용)
 * @returns {Promise<Array>} 메카닉 목록
 */
export const fetchInteractiveMechanics = async () => {
  try {
    console.log('⚙️ 전체 메카닉 목록 조회 시작...');
    
    const response = await trendApiClient.get('/api/trends/interactive/mechanics');
    console.log('✅ 전체 메카닉 목록 조회 완료:', response.data.data?.length || 0, '개 메카닉');
    
    return response.data.data || response.data;
  } catch (error) {
    console.error('메카닉 목록 조회 실패:', error);
    throw new Error(`메카닉 목록 로딩 실패: ${error.message}`);
  }
};

/**
 * 인기 메카닉 목록 조회 API (필터링용 상위 30개)
 * @returns {Promise<Array>} 인기 메카닉 목록
 */
export const fetchInteractivePopularMechanics = async () => {
  try {
    console.log('⚙️ 인기 메카닉 목록 조회 시작...');
    
    const response = await trendApiClient.get('/api/trends/interactive/mechanics/popular');
    console.log('✅ 인기 메카닉 목록 조회 완료:', response.data.data?.length || 0, '개 인기 메카닉');
    
    return response.data.data || response.data;
  } catch (error) {
    console.error('인기 메카닉 목록 조회 실패:', error);
    throw new Error(`인기 메카닉 목록 로딩 실패: ${error.message}`);
  }
};

/**
 * 인터랙티브 시스템 헬스 체크 API
 * @returns {Promise<Object>} 헬스 상태 정보
 */
export const fetchInteractiveHealth = async () => {
  try {
    const response = await trendApiClient.get('/api/trends/interactive/health');
    return response.data.data || response.data;
  } catch (error) {
    console.error('인터랙티브 헬스 체크 실패:', error);
    throw new Error(`인터랙티브 시스템 헬스 체크 실패: ${error.message}`);
  }
};


/**
 * 필터 조건 변경에 따른 모든 시각화 데이터 업데이트
 * @param {Object} filters - 변경된 필터 조건
 * @returns {Promise<Object>} 업데이트된 모든 시각화 데이터
 */
export const fetchInteractiveVisualizationUpdate = async (filters) => {
  try {
    console.log('🔄 시각화 데이터 업데이트 시작:', filters);
    
    // 병렬로 모든 시각화 데이터 조회 (동일한 필터 조건 사용)
    const [filteredGames, bubbleData, heatmapData] = await Promise.all([
      fetchInteractiveFilteredGames(filters),
      fetchInteractiveBubbleChart({
        groupBy: filters.groupBy || 'categories',
        complexityMin: filters.complexityMin || 1.0,
        complexityMax: filters.complexityMax || 5.0,
        players: filters.players || [],
        categories: filters.categories || [],
        mechanics: filters.mechanics || [],
        limit: filters.limit || 500
      }),
      fetchInteractiveHeatmap({
        complexityMin: filters.complexityMin || 1.0,
        complexityMax: filters.complexityMax || 5.0,
        players: filters.players || [],
        categories: filters.categories || [],
        mechanics: filters.mechanics || [],
        limit: filters.limit || 500
      })
    ]);
    
    const result = {
      filteredGames,
      bubbleData,
      heatmapData,
      appliedFilters: filters,
      lastUpdated: new Date()
    };
    
    console.log('✅ 시각화 데이터 업데이트 완료');
    console.log(`📊 업데이트 결과: ${filteredGames.length}개 게임, ${bubbleData.length}개 버블, ${heatmapData.length}개 히트맵 셀`);
    
    return result;
  } catch (error) {
    console.error('시각화 데이터 업데이트 실패:', error);
    throw new Error(`시각화 데이터 업데이트 실패: ${error.message}`);
  }
};

// 기본 내보내기
export default trendApiClient;