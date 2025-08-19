import axios from 'axios';

// API 클라이언트 기본 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Spring Boot 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

// 모든 API 요청에 자동으로 인증 토큰을 포함시키는 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// --- 기획안 검토 관련 API ---

/**
 * [API] 검토 대기 중인 기획안 목록 조회
 */
export const getPendingPlans = async () => {
  const response = await apiClient.get('/review/pending');
  return response.data;
};

/**
 * [API] 기획안 상세 정보 조회 (✅ 새로 추가된 함수)
 */
export const getPlanDetails = async (planId) => {
  // 백엔드에 GET /api/plans/{planId} 엔드포인트가 필요합니다.
  const response = await apiClient.get(`/plans/${planId}`);
  return response.data;
};


/**
 * [API] 기획안 승인 또는 반려 처리
 */
export const reviewPlan = async ({ planId, approve, reason }) => {
  const response = await apiClient.post('/review/approve', {
    planId,
    approve,
    reason: reason || null,
  });
  return response.data;
};


// --- 개발자 배정 관련 API ---

/**
 * [API] 모든 개발자 역할의 사용자 목록 조회
 */
export const getAllDevelopers = async () => {
  const response = await apiClient.get('/users/developers');
  return response.data;
};

/**
 * [API] 프로젝트에 개발자 배정
 */
export const assignDeveloper = async (projectId, developerId) => {
  const response = await apiClient.put(`/projects/${projectId}/assign-developer`, { userId: developerId });
  return response.data;
};

// ===== 제출된 컴포넌트 목록 조회 (프로젝트별 그룹) =====
export const getPendingComponentsGrouped = async () => {
  const res = await apiClient.get('/review/components/pending/grouped');
  return res.data;
};

// ===== 컴포넌트 상세 조회 =====
export const getComponentDetail = async (componentId) => {
  const res = await apiClient.get(`/review/components/${componentId}`);
  return res.data;
};

// ===== 컴포넌트 승인/반려 처리 =====
export const reviewComponent = async ({ componentId, approve, reason }) => {
  const res = await apiClient.post('/review/components/decision', {
    componentId,
    approve,
    reason,
  });
  return res.data; // 성공 메시지
};

/**
 * [API] 전체 프로젝트 목록 조회
 */
export const getAllProjects = async () => {
  const response = await apiClient.get('/projects');
  return response.data;
};