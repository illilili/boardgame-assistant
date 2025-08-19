import React, { useEffect, useState } from 'react';
import { fetchAllUsers, unlockUser, assignRole } from '../../api/admin';
import { useNavigate } from 'react-router-dom';

import Header from '../../mainPage/Header';
import Footer from '../../mainPage/Footer';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 로컬스토리지에서 토큰 확인
  const token = localStorage.getItem('accessToken');

  // 사용자 목록 로드
  const loadUsers = async () => {
    try {
      const response = await fetchAllUsers();
      // API 형태에 맞게 데이터 꺼내 사용 (response.data 혹은 response)
      setUsers(response.data ?? response);
    } catch (error) {
      console.error('유저 불러오기 실패:', error);
      alert('사용자 목록을 불러오는 데 실패했습니다. 다시 로그인해주세요.');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      alert('관리자 권한이 필요합니다. 로그인 페이지로 이동합니다.');
      setLoading(false);
      navigate('/login');
      return;
    }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnlock = async (email) => {
    try {
      await unlockUser(email, token);
      alert(`${email} 계정이 잠금 해제되었습니다.`);
      loadUsers();
    } catch (error) {
      console.error('잠금 해제 실패:', error);
      alert('계정 잠금 해제에 실패했습니다.');
    }
  };

  const handleAssignRole = async (userId, newRole) => {
    if (!newRole) return alert('역할을 선택해주세요!');
    try {
      const res = await assignRole(userId, newRole);
      alert(res?.data?.message ?? '역할이 변경되었습니다.');
      loadUsers();
    } catch (error) {
      console.error('역할 부여 실패:', error);
      alert(error.response?.data?.message || '역할 부여에 실패했습니다.');
    }
  };

  return (
    <>
      <Header projectMode />
      <main className="admin-container">
        <div className="admin-card">
          <h2 className="admin-title">관리자 유저 관리</h2>

          {loading ? (
            <div className="admin-loading">로딩 중...</div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
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
                      <td>
                        <span
                          className={`admin-badge ${
                            u.accountLocked ? 'locked' : 'active'
                          }`}
                        >
                          {u.accountLocked ? '잠김' : '정상'}
                        </span>
                      </td>
                      <td>
                        {u.accountLocked ? (
                          <button
                            onClick={() => handleUnlock(u.email)}
                            className="admin-btn"
                          >
                            Unlock
                          </button>
                        ) : (
                          <span className="admin-muted">-</span>
                        )}
                      </td>
                      <td>
                        <select
                          defaultValue={u.role}
                          onChange={(e) => handleAssignRole(u.userId, e.target.value)}
                          className="admin-select"
                          disabled={u.role === 'ADMIN'}
                          aria-label="역할 선택"
                        >
                          {u.role === 'ADMIN' && <option value="ADMIN">ADMIN</option>}
                          <option value="USER">USER</option>
                          <option value="PLANNER">PLANNER</option>
                          <option value="DEVELOPER">DEVELOPER</option>
                          <option value="PUBLISHER">PUBLISHER</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="admin-empty">
                        표시할 사용자가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Admin;
