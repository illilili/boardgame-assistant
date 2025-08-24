// src/api/request.js
const API_BASE_URL = 'https://615ckg0wf0.execute-api.ap-northeast-2.amazonaws.com';

export const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('accessToken');
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { ...options, headers };
  const response = await fetch(url, config);

  const text = await response.text();
  const contentType = response.headers.get('content-type');
  const data = contentType?.startsWith('application/json') ? (text ? JSON.parse(text) : {}) : text;

  if (!response.ok) {
    throw new Error(data?.message || `서버 에러: ${response.status}`);
  }
  return data;
};
