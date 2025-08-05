import React, { useEffect, useState } from 'react';
import { fetchAllUsers, unlockUser } from '../../api/admin';

const AdminUserManagePage = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const loadUsers = async () => {
    try {
    // console.log(localStorage.getItem('accessToken')); 토큰 가져오기
      const response = await fetchAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('유저 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUnlock = async (email) => {
    try {
      await unlockUser(email, token);
      alert(`${email} 계정이 잠금 해제되었습니다.`);
      loadUsers(); // 해제 후 목록 리프레시
    } catch (error) {
      console.error('잠금 해제 실패:', error);
    }
  };

  return (
    <div>
      <h2>관리자 유저 관리</h2>
      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>이메일</th>
              <th>아이디</th>
              <th>상태</th>
              <th>잠금 해제</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId}>
                <td>{u.email}</td>
                <td>{u.userId}</td>
                <td>{u.accountLocked ? '잠김' : '정상'}</td>
                <td>
                  {u.accountLocked && (
                    <button onClick={() => handleUnlock(u.email)}>Unlock</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUserManagePage;
