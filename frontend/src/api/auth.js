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
        
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.startsWith('application/json')) {
            const text = await response.text();
            data = text ? JSON.parse(text) : {};
        } else {
            data = await response.text();
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
export const getConceptsForSummary = (projectId) => request(`/api/plans/concepts-for-summary/${projectId}`);
export const generateSummary = (conceptId) => request('/api/plans/generate-summary', { method: 'POST', body: JSON.stringify({ conceptId }) });
export const savePlanVersion = (versionData) => request('/api/plans/version/save', { method: 'POST', body: JSON.stringify(versionData) });
export const getPlanVersions = (planId) => request(`/api/plans/${planId}/versions`);
export const rollbackPlanVersion = (planId, rollbackData) => request(`/api/plans/${planId}/rollback`, { method: 'POST', body: JSON.stringify(rollbackData) });
export const getAllUsers = () => request('/api/users/all');
export const assignRole = (roleData) => request('/api/admin/assign-role', { method: 'POST', body: JSON.stringify(roleData) });
export const generateComponents = (componentData) => request('/api/plans/generate-components', { method: 'POST', body: JSON.stringify(componentData) });
export const regenerateComponents = (regenerateData) => request('/api/plans/regenerate-components', { method: 'POST', body: JSON.stringify(regenerateData) });
