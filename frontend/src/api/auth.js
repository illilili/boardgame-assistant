const API_BASE_URL = 'http://localhost:8080'; // Spring Boot 서버 주소

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

/**
 * [수정] 프로젝트 이름 수정 API 호출
 * @param {string | number} projectId - 수정할 프로젝트의 ID
 * @param {string} newTitle - 새로운 프로젝트 제목
 */
export const renameProject = (projectId, newTitle) => {
    // URL에 projectId를 포함하여 PUT 요청을 보냅니다.
    return request(`/api/projects/${projectId}/rename`, {
        method: 'PUT',
        body: JSON.stringify({ newTitle: newTitle }),
    });
};