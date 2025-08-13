import { request } from './request';

export const getCardPreview = (id) => request(`/api/content/${id}/preview/card`);
export const generateCardText = (data) => request('/api/content/generate-text', { method: 'POST', body: JSON.stringify(data) });
export const generateCardImage = (data) => request('/api/content/generate-image', { method: 'POST', body: JSON.stringify(data) });