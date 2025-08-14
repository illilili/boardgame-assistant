import { request } from './request';

// 썸네일 생성 API
export const generateThumbnail = (data) =>
  request('/api/content/generate-thumbnail', {
    method: 'POST',
    body: JSON.stringify(data), // { contentId: number }
  });

  // 썸네일 미리보기 가져오기
export const getThumbnailPreview = (contentId) =>
  request(`/api/content/${contentId}/preview/thumbnail`, {
    method: 'GET',
  });

  // 3D 모델 미리보기 가져오기
export const getModel3DPreview = (contentId) =>
  request(`/api/content/${contentId}/preview/3d`, {
    method: 'GET',
  });

// 3D 모델 생성
export const generate3DModel = (data) =>
  request('/api/content/generate-3d', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data), // { contentId, name, description, componentInfo, theme, storyline, style }
  });



  // 카드 생성

  // 카드 콘텐츠 미리보기 데이터 조회
// 카드 콘텐츠 미리보기 데이터 조회
export const getCardPreview = (contentId) =>
  request(`/api/content/${contentId}/preview/card`, {
    method: 'GET',
  });

// 카드 텍스트 생성 요청
export const generateCardText = (data) =>
  request('/api/content/generate-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data), // { contentId, name, effect, description }
  });

// 카드 이미지 생성 요청
export const generateCardImage = (data) =>
  request('/api/content/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data), // { contentId, name, effect, description }
  });

  // 룰북 생성 API
export const generateRulebook = (data) =>
  request('/api/content/generate-rulebook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data), // { contentId: number }
  });
