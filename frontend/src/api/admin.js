import axios from 'axios';

const USER_URL = 'http://localhost:8080/api/admin';
const PROJECT_URL = 'http://localhost:8080/api/projects';

// === 유저 관리 ===
export const fetchAllUsers = async () => {
  const token = localStorage.getItem("accessToken");
  return axios.get(`${USER_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const unlockUser = async (email) => {
  const token = localStorage.getItem("accessToken");
  return axios.post(`${USER_URL}/unlock-user`, { email }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const assignRole = async (userId, newRole) => {
  const token = localStorage.getItem("accessToken");
  return axios.post(`${USER_URL}/assign-role`, { userId, newRole }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// === 프로젝트 관리 ===
export const fetchAllProjects = async () => {
  const token = localStorage.getItem("accessToken");
  return axios.get(`${PROJECT_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteProject = async (projectId) => {
  const token = localStorage.getItem("accessToken");
  return axios.delete(`${PROJECT_URL}/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
