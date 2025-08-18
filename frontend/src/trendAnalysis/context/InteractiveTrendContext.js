import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  fetchInteractiveDashboardInitData,
  fetchInteractiveVisualizationUpdate,
  formatTrendApiError
} from '../services/trendApiService';

/**
 * 인터랙티브 트렌드 분석 전역 상태 관리
 * 
 * 관리하는 상태:
 * - 필터 설정 (난이도, 플레이어 수, 카테고리, 메카닉)
 * - 시각화 데이터 (버블차트, 히트맵, 게임 목록)
 * - UI 상태 (로딩, 에러, 선택된 항목)
 * - 캐시 및 최적화 상태
 */

// 초기 상태
const initialState = {
  // 데이터 상태
  initData: null,
  visualizationData: {
    filteredGames: [],
    bubbleData: [],
    heatmapData: []
  },
  
  // 필터 상태
  filters: {
    complexityMin: 1.0,
    complexityMax: 5.0,
    players: [],
    categories: [],
    mechanics: [],
    limit: 500,
    groupBy: 'categories',
    sortBy: 'geek_rating',
    sortOrder: 'desc'
  },
  
  // UI 상태
  loading: {
    init: false,
    update: false,
    export: false
  },
  
  error: null,
  lastUpdated: null,
  
  // 선택 상태
  selectedItems: {
    bubble: null,
    heatmapCell: null,
    games: []
  },
  
  // 캐시 상태
  cache: {
    filters: {},
    data: {},
    expiry: {}
  },
  
  // 설정 상태
  config: {
    autoUpdate: true,
    cacheEnabled: true,
    cacheTimeout: 300000, // 5분
    debounceDelay: 300
  }
};

// 액션 타입
const ActionTypes = {
  // 초기화
  INIT_START: 'INIT_START',
  INIT_SUCCESS: 'INIT_SUCCESS',
  INIT_ERROR: 'INIT_ERROR',
  
  // 필터 업데이트
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS',
  
  // 데이터 업데이트
  UPDATE_START: 'UPDATE_START',
  UPDATE_SUCCESS: 'UPDATE_SUCCESS',
  UPDATE_ERROR: 'UPDATE_ERROR',
  
  // 선택 상태
  SELECT_BUBBLE: 'SELECT_BUBBLE',
  SELECT_HEATMAP_CELL: 'SELECT_HEATMAP_CELL',
  SELECT_GAMES: 'SELECT_GAMES',
  CLEAR_SELECTIONS: 'CLEAR_SELECTIONS',
  
  // 에러 관리
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // 캐시 관리
  SET_CACHE: 'SET_CACHE',
  CLEAR_CACHE: 'CLEAR_CACHE',
  
  // 설정
  UPDATE_CONFIG: 'UPDATE_CONFIG'
};

// 리듀서
function interactiveTrendReducer(state, action) {
  switch (action.type) {
    case ActionTypes.INIT_START:
      return {
        ...state,
        loading: { ...state.loading, init: true },
        error: null
      };
      
    case ActionTypes.INIT_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, init: false },
        initData: action.payload,
        visualizationData: {
          filteredGames: action.payload.initialGames || [],
          bubbleData: action.payload.initialBubbleData || [],
          heatmapData: action.payload.initialHeatmapData || []
        },
        lastUpdated: new Date(),
        error: null
      };
      
    case ActionTypes.INIT_ERROR:
      return {
        ...state,
        loading: { ...state.loading, init: false },
        error: action.payload
      };
      
    case ActionTypes.UPDATE_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
      
    case ActionTypes.RESET_FILTERS:
      return {
        ...state,
        filters: {
          complexityMin: 1.0,
          complexityMax: 5.0,
          players: [],
          categories: [],
          mechanics: [],
          limit: 500,
          groupBy: 'categories',
          sortBy: 'geek_rating',
          sortOrder: 'desc'
        }
      };
      
    case ActionTypes.UPDATE_START:
      return {
        ...state,
        loading: { ...state.loading, update: true },
        error: null
      };
      
    case ActionTypes.UPDATE_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, update: false },
        visualizationData: {
          filteredGames: action.payload.filteredGames || [],
          bubbleData: action.payload.bubbleData || [],
          heatmapData: action.payload.heatmapData || []
        },
        lastUpdated: new Date(),
        error: null
      };
      
    case ActionTypes.UPDATE_ERROR:
      return {
        ...state,
        loading: { ...state.loading, update: false },
        error: action.payload
      };
      
    case ActionTypes.SELECT_BUBBLE:
      return {
        ...state,
        selectedItems: {
          ...state.selectedItems,
          bubble: action.payload
        }
      };
      
    case ActionTypes.SELECT_HEATMAP_CELL:
      return {
        ...state,
        selectedItems: {
          ...state.selectedItems,
          heatmapCell: action.payload
        }
      };
      
    case ActionTypes.SELECT_GAMES:
      return {
        ...state,
        selectedItems: {
          ...state.selectedItems,
          games: action.payload
        }
      };
      
    case ActionTypes.CLEAR_SELECTIONS:
      return {
        ...state,
        selectedItems: {
          bubble: null,
          heatmapCell: null,
          games: []
        }
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case ActionTypes.SET_CACHE:
      return {
        ...state,
        cache: {
          ...state.cache,
          ...action.payload
        }
      };
      
    case ActionTypes.CLEAR_CACHE:
      return {
        ...state,
        cache: initialState.cache
      };
      
    case ActionTypes.UPDATE_CONFIG:
      return {
        ...state,
        config: { ...state.config, ...action.payload }
      };
      
    default:
      return state;
  }
}

// Context 생성
const InteractiveTrendContext = createContext();

// Provider 컴포넌트
export function InteractiveTrendProvider({ children }) {
  const [state, dispatch] = useReducer(interactiveTrendReducer, initialState);
  
  // 디바운스 타이머 참조
  const debounceTimerRef = React.useRef(null);
  
  // 캐시 키 생성 함수
  const generateCacheKey = useCallback((filters) => {
    return JSON.stringify(filters);
  }, []);
  
  // 캐시 확인 함수
  const getCachedData = useCallback((filters) => {
    if (!state.config.cacheEnabled) return null;
    
    const cacheKey = generateCacheKey(filters);
    const cachedData = state.cache.data[cacheKey];
    const expiry = state.cache.expiry[cacheKey];
    
    if (cachedData && expiry && Date.now() < expiry) {
      console.log('✅ 캐시된 데이터 사용:', cacheKey);
      return cachedData;
    }
    
    return null;
  }, [state.cache, state.config.cacheEnabled, generateCacheKey]);
  
  // 캐시 저장 함수
  const setCachedData = useCallback((filters, data) => {
    if (!state.config.cacheEnabled) return;
    
    const cacheKey = generateCacheKey(filters);
    const expiry = Date.now() + state.config.cacheTimeout;
    
    dispatch({
      type: ActionTypes.SET_CACHE,
      payload: {
        data: { ...state.cache.data, [cacheKey]: data },
        expiry: { ...state.cache.expiry, [cacheKey]: expiry }
      }
    });
  }, [state.cache, state.config, generateCacheKey]);
  
  // 초기 데이터 로딩
  const initializeDashboard = useCallback(async () => {
    try {
      dispatch({ type: ActionTypes.INIT_START });
      
      console.log('🚀 인터랙티브 대시보드 초기화 시작...');
      const data = await fetchInteractiveDashboardInitData();
      
      dispatch({
        type: ActionTypes.INIT_SUCCESS,
        payload: data
      });
      
      console.log('✅ 인터랙티브 대시보드 초기화 완료');
    } catch (error) {
      console.error('❌ 대시보드 초기화 실패:', error);
      dispatch({
        type: ActionTypes.INIT_ERROR,
        payload: formatTrendApiError(error)
      });
    }
  }, []);
  
  // 시각화 데이터 업데이트
  const updateVisualizationData = useCallback(async (newFilters) => {
    const filters = { ...state.filters, ...newFilters };
    
    // 캐시 확인
    const cachedData = getCachedData(filters);
    if (cachedData) {
      dispatch({
        type: ActionTypes.UPDATE_SUCCESS,
        payload: cachedData
      });
      return;
    }
    
    try {
      dispatch({ type: ActionTypes.UPDATE_START });
      
      console.log('🔄 시각화 데이터 업데이트 시작:', filters);
      const data = await fetchInteractiveVisualizationUpdate(filters);
      
      dispatch({
        type: ActionTypes.UPDATE_SUCCESS,
        payload: data
      });
      
      // 캐시 저장
      setCachedData(filters, data);
      
      console.log('✅ 시각화 데이터 업데이트 완료');
    } catch (error) {
      console.error('❌ 시각화 데이터 업데이트 실패:', error);
      dispatch({
        type: ActionTypes.UPDATE_ERROR,
        payload: formatTrendApiError(error)
      });
    }
  }, [state.filters, getCachedData, setCachedData]);
  
  // 디바운스된 필터 업데이트
  const updateFilters = useCallback((newFilters) => {
    // 즉시 필터 상태 업데이트
    dispatch({
      type: ActionTypes.UPDATE_FILTERS,
      payload: newFilters
    });
    
    // 자동 업데이트가 활성화된 경우 디바운스된 업데이트 실행
    if (state.config.autoUpdate) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        updateVisualizationData(newFilters);
      }, state.config.debounceDelay);
    }
  }, [state.config.autoUpdate, state.config.debounceDelay, updateVisualizationData]);
  
  // 필터 초기화
  const resetFilters = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_FILTERS });
    
    if (state.config.autoUpdate) {
      const resetFilters = {
        complexityMin: 1.0,
        complexityMax: 5.0,
        players: [],
        categories: [],
        mechanics: [],
        limit: 500,
        groupBy: 'categories',
        sortBy: 'geek_rating',
        sortOrder: 'desc'
      };
      updateVisualizationData(resetFilters);
    }
  }, [state.config.autoUpdate, updateVisualizationData]);
  
  // 선택 상태 관리
  const selectBubble = useCallback((bubble) => {
    dispatch({
      type: ActionTypes.SELECT_BUBBLE,
      payload: bubble
    });
  }, []);
  
  const selectHeatmapCell = useCallback((cell) => {
    dispatch({
      type: ActionTypes.SELECT_HEATMAP_CELL,
      payload: cell
    });
  }, []);
  
  const selectGames = useCallback((games) => {
    dispatch({
      type: ActionTypes.SELECT_GAMES,
      payload: games
    });
  }, []);
  
  const clearSelections = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_SELECTIONS });
  }, []);
  
  // 에러 관리
  const setError = useCallback((error) => {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: formatTrendApiError(error)
    });
  }, []);
  
  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);
  
  // 캐시 관리
  const clearCache = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_CACHE });
  }, []);
  
  // 설정 업데이트
  const updateConfig = useCallback((config) => {
    dispatch({
      type: ActionTypes.UPDATE_CONFIG,
      payload: config
    });
  }, []);
  
  // 컴포넌트 언마운트 시 디바운스 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // Context 값
  const contextValue = {
    // 상태
    ...state,
    
    // 액션
    initializeDashboard,
    updateVisualizationData,
    updateFilters,
    resetFilters,
    
    // 선택 관리
    selectBubble,
    selectHeatmapCell,
    selectGames,
    clearSelections,
    
    // 에러 관리
    setError,
    clearError,
    
    // 캐시 관리
    clearCache,
    
    // 설정
    updateConfig,
    
    // 유틸리티
    getCachedData,
    setCachedData,
    generateCacheKey
  };
  
  return (
    <InteractiveTrendContext.Provider value={contextValue}>
      {children}
    </InteractiveTrendContext.Provider>
  );
}

// Hook
export function useInteractiveTrend() {
  const context = useContext(InteractiveTrendContext);
  
  if (context === undefined) {
    throw new Error('useInteractiveTrend must be used within an InteractiveTrendProvider');
  }
  
  return context;
}

// 선택적 Hook들
export function useInteractiveTrendFilters() {
  const { filters, updateFilters, resetFilters } = useInteractiveTrend();
  return { filters, updateFilters, resetFilters };
}

export function useInteractiveTrendData() {
  const { visualizationData, loading, error, lastUpdated } = useInteractiveTrend();
  return { visualizationData, loading, error, lastUpdated };
}

export function useInteractiveTrendSelections() {
  const { 
    selectedItems, 
    selectBubble, 
    selectHeatmapCell, 
    selectGames, 
    clearSelections 
  } = useInteractiveTrend();
  
  return {
    selectedItems,
    selectBubble,
    selectHeatmapCell,
    selectGames,
    clearSelections
  };
}

export default InteractiveTrendContext;