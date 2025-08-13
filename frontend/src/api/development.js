import { request } from './request';

// 썸네일 생성 API
export const generateThumbnail = (data) =>
  request('/api/content/generate-thumbnail', {
    method: 'POST',
    body: JSON.stringify(data), // { contentId: number }
  });