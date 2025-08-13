import axios from 'axios';

// API 기본 URL 설정 (Spring Boot 서버 주소)
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Spring Boot 서버 주소에 맞게 변경하세요.
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * [API] 카드 미리보기 정보 조회
 * @param {number} contentId - 콘텐츠 ID
 * @returns {Promise<any>}
 */
export const getCardPreview = async (contentId) => {
    try {
        const response = await apiClient.get(`/content/${contentId}/preview/card`);
        return response.data;
    } catch (error) {
        console.error("Error fetching card preview:", error);
        throw error.response ? error.response.data : new Error("네트워크 오류 또는 서버 응답 없음");
    }
};

/**
 * [API] AI 카드 텍스트 생성
 * @param {object} requestData - { contentId, name, effect, description }
 * @returns {Promise<any>}
 */
export const generateCardText = async (requestData) => {
    try {
        const response = await apiClient.post('/content/generate-text', requestData);
        return response.data;
    } catch (error) {
        console.error("Error generating card text:", error);
        throw error.response ? error.response.data : new Error("네트워크 오류 또는 서버 응답 없음");
    }
};

/**
 * [API] AI 카드 이미지 생성
 * @param {object} requestData - { contentId, name, effect, description }
 * @returns {Promise<any>}
 */
export const generateCardImage = async (requestData) => {
    try {
        const response = await apiClient.post('/content/generate-image', requestData);
        return response.data;
    } catch (error) {
        console.error("Error generating card image:", error);
        throw error.response ? error.response.data : new Error("네트워크 오류 또는 서버 응답 없음");
    }
};

// 필요한 다른 API 함수들도 여기에 추가할 수 있습니다.