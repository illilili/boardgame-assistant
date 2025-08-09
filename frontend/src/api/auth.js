// 파일 위치: src/api/auth.js

const API_BASE_URL = 'http://localhost:8080';

const request = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const config = { ...options, headers };

    try {
        const response = await fetch(url, config);
        
        // 🚨 응답이 JSON인지 확인하는 로직 추가
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.startsWith('application/json')) {
            const text = await response.text();
            data = text ? JSON.parse(text) : {};
        } else {
            // JSON이 아니면 텍스트로 처리
            data = await response.text();
        }

        if (!response.ok) {
            // 에러 메시지를 data 객체에서 가져오거나, 일반 텍스트 그대로 사용
            const errorMessage = (typeof data === 'object' && data.message) ? data.message : data;
            throw new Error(errorMessage || `서버 에러: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`API 요청 실패: ${endpoint}`, error);
        throw error;
    }
};

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

// 🚨 [신규] 게임 규칙 생성 API 함수 추가
export const generateRule = (ruleData) => request('/api/plans/generate-rule', { method: 'POST', body: JSON.stringify(ruleData) });
// 🚨 [신규] 게임 규칙 재생성 API 함수 추가
export const regenerateRule = (regenerateData) => request('/api/plans/regenerate-rule', { method: 'POST', body: JSON.stringify(regenerateData) });
// 🚨 [신규] 컴포넌트 생성 API 함수 추가
export const generateComponents = (componentsData) => request('/api/plans/generate-components', { method: 'POST', body: JSON.stringify(componentsData) });

// 🚨 [신규] 컴포넌트 재생성 API 함수 추가
export const regenerateComponents = (regenerateData) => request('/api/plans/regenerate-components', { method: 'POST', body: JSON.stringify(regenerateData) });
export const getMyRules = () => request('/api/balance/rules');
export const runSimulation = (simulationData) => request('/api/balance/simulate', { method: 'POST', body: JSON.stringify(simulationData) });
export const analyzeBalance = (analysisData) => request('/api/balance/analyze', { method: 'POST', body: JSON.stringify(analysisData) });
export const getMyRulesByProject = (projectId) => request(`/api/balance/rules/${projectId}`);
