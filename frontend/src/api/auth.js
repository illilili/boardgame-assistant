// 파일 위치: src/api/auth.js

const API_BASE_URL = 'http://localhost:8080';

const request = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('accessToken');
    const headers = {
        // FormData의 경우 Content-Type을 설정하지 않아야 브라우저가 자동으로 올바른 값을 설정합니다.
        ...options.headers,
    };
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...options, headers };

    try {
        const response = await fetch(url, config);
        
        const contentType = response.headers.get('content-type');
        let data;

        const text = await response.text();
        if (contentType && contentType.startsWith('application/json')) {
            data = text ? JSON.parse(text) : {};
        } else {
            data = text;
        }

        if (!response.ok) {
            const errorMessage = (typeof data === 'object' && data.message) ? data.message : data;
            throw new Error(errorMessage || `서버 에러: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`API 요청 실패: ${endpoint}`, error);
        throw error;
    }
};

// --- 기존 함수들 ---
export const signup = (signupData) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(signupData) });
export const login = (loginData) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(loginData) });
export const logout = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        request('/api/auth/logout', { method: 'POST' }).catch(err => console.error("로그아웃 API 호출 실패:", err));
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};
export const getMyPageInfo = () => request('/api/users/mypage');
export const createProject = (projectData) => request('/api/projects', { method: 'POST', body: JSON.stringify(projectData) });
export const renameProject = (projectId, newTitle) => {
    return request(`/api/projects/${projectId}/rename`, {
        method: 'PUT',
        body: JSON.stringify({ newTitle: newTitle }),
    });
};
export const getMyProjects = () => request('/api/projects/my');
export const generateConcept = (conceptData) => request('/api/plans/generate-concept', { method: 'POST', body: JSON.stringify(conceptData) });
export const regenerateConcept = (regenerateData) => request('/api/plans/regenerate-concept', { method: 'POST', body: JSON.stringify(regenerateData) });
export const getAllConcepts = () => request('/api/plans/concepts');
export const generateGoal = (goalData) => request('/api/plans/generate-goal', { method: 'POST', body: JSON.stringify(goalData) });
export const generateRule = (ruleData) => request('/api/plans/generate-rule', { method: 'POST', body: JSON.stringify(ruleData) });
export const regenerateRule = (regenerateData) => request('/api/plans/regenerate-rule', { method: 'POST', body: JSON.stringify(regenerateData) });
export const getMyRulesByProject = (projectId) => request(`/api/balance/rules/${projectId}`);
export const runSimulation = (simulationData) => request('/api/balance/simulate', { method: 'POST', body: JSON.stringify(simulationData) });
export const analyzeBalance = (analysisData) => request('/api/balance/analyze', { method: 'POST', body: JSON.stringify(analysisData) });
export const getConceptsForSummary = () => request('/api/plans/concepts-for-summary');
export const generateSummary = (conceptId) => request('/api/plans/generate-summary', { method: 'POST', body: JSON.stringify({ conceptId }) });
export const savePlanVersion = (versionData) => request('/api/plans/version/save', { method: 'POST', body: JSON.stringify(versionData) });
export const getPlanVersions = (planId) => request(`/api/plans/${planId}/versions`);
export const rollbackPlanVersion = (planId, rollbackData) => request(`/api/plans/${planId}/rollback`, { method: 'POST', body: JSON.stringify(rollbackData) });
export const getAllUsers = () => request('/api/users/all');
export const assignRole = (roleData) => request('/api/admin/assign-role', { method: 'POST', body: JSON.stringify(roleData) });
export const generateComponents = (componentData) => request('/api/plans/generate-components', { method: 'POST', body: JSON.stringify(componentData) });
export const regenerateComponents = (regenerateData) => request('/api/plans/regenerate-components', { method: 'POST', body: JSON.stringify(regenerateData) });

// ✨ 1. 기획안 제출 API 함수 추가
export const submitPlan = (planId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return request(`/api/plans/${planId}/submit`, {
        method: 'POST',
        body: formData,
    });
};

// ✨ (참고) 임시 문서 업로드 함수도 필요하다면 아래와 같이 만듭니다.
export const uploadPlanDoc = (planId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return request(`/api/plans/${planId}/upload-doc`, {
        method: 'POST',
        body: formData,
    });
};

// --- 추가된 API 함수들 ---

// 기획안 상세 조회 API (GET /api/plans/{planId})
export const getPlanDetail = (planId) => request(`/api/plans/${planId}`);

// 기획안 삭제 API (DELETE /api/plans/{planId})
export const deletePlan = (planId) => request(`/api/plans/${planId}`, { method: 'DELETE' });

// 기획안 저장 API (POST /api/plans/save)
// 백엔드에는 save 엔드포인트가 없으므로 이 요청은 기획안 버전을 저장하는 savePlanVersion 함수를 사용해야 합니다.
// '기획안 저장'이 '버전 저장'을 의미한다고 가정하고 아래 함수를 사용합니다.

/**
 * 기획안 내용을 저장(수정)하는 API
 * @param {object} planData - { planId: number, planContent: string }
 * @returns {Promise<object>} - 저장 결과 데이터
 */
export const savePlan = async (planData) => {
  // 로컬 스토리지에서 인증 토큰을 가져옵니다.
  const token = localStorage.getItem('token');

  const response = await fetch('/api/plans/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 토큰이 있다면 Authorization 헤더에 추가합니다.
      'Authorization': `Bearer ${token}`
    },
    // 백엔드로 보낼 데이터를 JSON 문자열 형태로 변환합니다.
    body: JSON.stringify(planData),
  });

  // 응답이 성공적이지 않으면 에러를 발생시킵니다.
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '기획안 저장에 실패했습니다.');
  }

  // 성공적인 응답 데이터를 JSON 형태로 반환합니다.
  return response.json();
};