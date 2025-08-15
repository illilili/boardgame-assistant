// 파일 위치: src/api/publish.js

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

/**
 * 번역 요청
 * @param {object} translationData - { contentId, languageCode }
 */
export const requestTranslations = (translationData) => request('/api/translations/request', {
    method: 'POST',
    body: JSON.stringify(translationData),
});

/**
 * 콘텐츠별 번역 조회
 * @param {string} contentId - 콘텐츠 ID
 */
export const getTranslationsByContent = (contentId) => request(`/api/translations/content/${contentId}`, {
    method: 'GET',
});

/**
 * 번역 완료 처리
 * @param {string} translationId - 번역 ID
 * @param {object} translationData - 번역 데이터
 */
export const completeTranslation = (translationId, translationData) => request(`/api/translations/${translationId}/complete`, {
    method: 'PUT',
    body: JSON.stringify(translationData),
});

/**
 * 프로젝트별 콘텐츠 조회
 * @param {string} projectId - 프로젝트 ID
 */
export const getContentsByProject = (projectId) => request(`/api/projects/${projectId}/contents`, {
    method: 'GET',
});

