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