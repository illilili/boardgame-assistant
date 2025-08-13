import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/admin';

//전체 유저 목록 가져오기
export const fetchAllUsers = async () => {
  const token = localStorage.getItem("accessToken");
//   console.log(localStorage.getItem('accessToken'));
  return axios.get(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

//계정 잠금 해제
export const unlockUser = async (email) => {
    const token = localStorage.getItem("accessToken");
  return axios.post(`${BASE_URL}/unlock-user`, { email }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

//역할 부여
export const assignRole = async (userId, newRole) => {
    const token = localStorage.getItem("accessToken");
    return axios.post(`${BASE_URL}/assign-role`, { userId, newRole }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};