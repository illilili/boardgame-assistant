import React, { useEffect, useState } from 'react';
import { fetchAllUsers, unlockUser, assignRole } from '../../api/admin';

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

  //역할배정
  const handleAssignRole = async (userId, newRole) => {
  if (!newRole) return alert("역할을 선택해주세요!");

  try {
    const res = await assignRole(userId, newRole);
    alert(res.data.message); // 백엔드 메시지 출력!
    loadUsers(); // 역할 변경 후 목록 새로고침
  } catch (error) {
    console.error('역할 부여 실패:', error);
    alert(error.response?.data?.message || "역할 부여에 실패했습니다. 다시 시도해주세요."); //
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
                <th>역할 부여</th>
            </tr>
            </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId}>
                <td>{u.email}</td>
                <td>{u.userId}</td>
                <td>{u.accountLocked ? '잠김' : '정상'}</td>
                
                {/* 잠금여부 */}
                <td>
                  {u.accountLocked && (
                    <button onClick={() => handleUnlock(u.email)}>Unlock</button>
                  )}
                </td>
                
                {/* 유저권한 */}
                <td>
                    <select
                    defaultValue=""
                    onChange={(e) => handleAssignRole(u.userId, e.target.value)}
                    >
                        <option value="USER">USER</option>
                        <option value="PLANNER">PLANNER</option>
                        <option value="DEVELOPER">DEVELOPER</option>
                        <option value="PUBLISHER">PUBLISHER</option>
                        {/* ADMIN은 제외 */}
                    </select>
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
