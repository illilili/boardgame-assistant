// 파일 위치: src/api/auth.js

const API_BASE_URL = 'http://localhost:8080';

const request = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('accessToken');
    const headers = {
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
export const logout = async () => {
    const token = localStorage.getItem('accessToken');
    let response;

    if (token) {
        response = await request('/api/auth/logout', { method: 'POST' });
    } else {
        response = { message: '이미 로그아웃된 상태입니다.' };
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');

    return response; // 응답 메시지 반환
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

// ✨ 기획안 제출 API 함수
export const submitPlan = (planId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return request(`/api/plans/${planId}/submit`, {
        method: 'POST',
        body: formData,
    });
};

// ✨ (참고) 임시 문서 업로드 함수
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
export const savePlan = (planData) => request('/api/plans/save', { method: 'POST', body: JSON.stringify(planData) });

export const getPendingPlans = () => request('/api/review/pending');
export const reviewPlan = (reviewData) => request('/api/review/approve', { method: 'POST', body: JSON.stringify(reviewData) });

// 🚨🚨🚨 수정된 부분: API 엔드포인트를 백엔드와 일치하도록 수정합니다.
export const getApprovedPlan = (projectId) => request(`/api/plans/approved/project/${projectId}`);

// 🚨 [신규] 모든 개발자 목록 조회 API 함수
export const getAllDevelopers = () => request('/api/users/developers');

// 🚨 [신규] 개발자 배정 API 함수
export const assignDeveloper = (projectId, assignData) => request(`/api/projects/${projectId}/assign-developer`, { method: 'PUT', body: JSON.stringify(assignData) });
// 🚨 다른 함수들과 동일하게 request 함수를 사용하도록 수정
export const getTasksForProject = (projectId) => request(`/api/projects/${projectId}/tasks`);


// --- 아래에 신규 카드 콘텐츠 관련 API 함수 추가 ---

/**
 * [신규] 카드 입력 폼에 필요한 미리보기 데이터를 가져옵니다.
 * @param {number} contentId - 콘텐츠 ID
 */
export const getCardPreview = (contentId) => request(`/api/content/${contentId}/preview/card`);

/**
 * [신규] AI를 통해 카드 문구를 생성합니다.
 * @param {object} cardData - { contentId, name, effect, description }
 */
export const generateCardText = (cardData) => request('/api/content/generate-text', {
    method: 'POST',
    body: JSON.stringify(cardData),
});

/**
 * [신규] AI를 통해 카드 이미지를 생성합니다.
 * @param {object} cardData - { contentId, name, effect, description }
 */
export const generateCardImage = (cardData) => request('/api/content/generate-image', {
    method: 'POST',
    body: JSON.stringify(cardData),
});