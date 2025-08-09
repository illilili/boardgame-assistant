// 파일 위치: src/api/auth.js (기존 파일에 추가)

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
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        if (!response.ok) {
            throw new Error(data.message || `서버 에러: ${response.status}`);
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

// 🚨 [신규] 로그인한 사용자의 프로젝트 목록을 가져오는 API 함수
export const getMyProjects = () => request('/api/projects/my');
// 🚨 [신규] 컨셉 생성 요청을 보내는 API 함수
export const generateConcept = (conceptData) => request('/api/plans/generate-concept', { method: 'POST', body: JSON.stringify(conceptData) });
// 🚨 [신규] 컨셉 재생성 요청을 보내는 API 함수
export const regenerateConcept = (regenerateData) => request('/api/plans/regenerate-concept', { method: 'POST', body: JSON.stringify(regenerateData) });
// 🚨 [신규] 모든 컨셉 목록을 가져오는 API 함수
export const getAllConcepts = () => request('/api/plans/concepts');