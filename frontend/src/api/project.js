// src/api/project.js
import { request } from './request';

export const createProject = (data) => request('/api/projects', { method: 'POST', body: JSON.stringify(data) });
export const renameProject = (id, newTitle) => request(`/api/projects/${id}/rename`, { method: 'PUT', body: JSON.stringify({ newTitle }) });
export const getMyProjects = () => request('/api/projects/my');
export const getAllProjects = () => request('/api/projects');
export const getProjectDetail = (id) => request(`/api/projects/${id}`);
export const assignDeveloper = (id, assignData) => request(`/api/projects/${id}/assign-developer`, { method: 'PUT', body: JSON.stringify(assignData) });
export const getTasksForProject = (id) => request(`/api/projects/${id}/tasks`);
export const getProjectStatus = (id) => request(`/api/projects/${id}/status`);