import axios from 'axios';

// API 클라이언트 기본 설정
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Spring Boot 서버 주소
    headers: {
        'Content-Type': 'application/json',
    },
});

// ★★★ 요청 인터셉터 ★★★
// 모든 API 요청이 보내지기 전에 이 코드가 먼저 실행됩니다.
apiClient.interceptors.request.use(
    (config) => {
        // localStorage에서 accessToken을 가져옵니다.
        const token = localStorage.getItem('accessToken');
        
        // 토큰이 존재하면, Authorization 헤더에 Bearer 토큰을 추가합니다.
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // 요청 에러 처리
        return Promise.reject(error);
    }
);

/**
 * [API] 새로운 프로젝트 생성
 */
export const createProject = async (data) => {
    const response = await apiClient.post('/projects', data);
    return response.data;
};

/**
 * [API] 프로젝트 이름 변경
 */
export const renameProject = async (id, newTitle) => {
    const response = await apiClient.put(`/projects/${id}/rename`, { newTitle });
    return response.data;
};

/**
 * [API] 로그인된 사용자의 프로젝트 목록 조회
 */
export const getMyProjects = async () => {
    const response = await apiClient.get('/projects/my');
    return response.data;
};

/**
 * [API] 모든 프로젝트 목록 조회 (관리자용)
 */
export const getAllProjects = async () => {
    const response = await apiClient.get('/projects');
    return response.data;
};

/**
 * [API] 특정 프로젝트의 상세 정보 조회
 */
export const getProjectDetail = async (id) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
};

/**
 * [API] 프로젝트에 개발자 배정
 */
export const assignDeveloper = async (id, assignData) => {
    const response = await apiClient.put(`/projects/${id}/assign-developer`, assignData);
    return response.data;
};

/**
 * [API] 특정 프로젝트의 태스크 목록 조회
 */
export const getTasksForProject = async (id) => {
    const response = await apiClient.get(`/projects/${id}/tasks`);
    return response.data;
};

/**
 * [API] 특정 프로젝트의 상태 조회
 */
export const getProjectStatus = async (id) => {
    const response = await apiClient.get(`/projects/${id}/status`);
    return response.data;
};
