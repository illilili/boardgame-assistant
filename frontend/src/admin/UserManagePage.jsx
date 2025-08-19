import React, { useEffect, useState, useCallback } from 'react';
import { fetchAllUsers, unlockUser, assignRole } from '../api/admin';
import { useNavigate } from 'react-router-dom';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import './UserManagePage.css';

const AdminUserManagePage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetchAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('유저 불러오기 실패:', error);
      alert('사용자 목록을 불러오는 데 실패했습니다. 다시 로그인해주세요.');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!token) {
      alert('관리자 권한이 필요합니다. 로그인 페이지로 이동합니다.');
      setLoading(false);
      navigate('/login');
      return;
    }
    loadUsers();
  }, [token, loadUsers, navigate]);

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
    if (!newRole) return alert("역할을 선택해주세요!");
    try {
      const res = await assignRole(userId, newRole);
      alert(res.data.message);
      loadUsers();
    } catch (error) {
      console.error('역할 부여 실패:', error);
      alert(error.response?.data?.message || "역할 부여에 실패했습니다.");
    }
  };

  // 이름: 가운데 한 글자만 * 처리
  const maskName = (name) => {
    if (!name) return "-";
    if (name.length === 2) {
      return name[0] + "*";
    }
    if (name.length > 2) {
      return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
    }
    return name; // 한 글자는 그대로
  };

// 이메일: @ 앞 두 글자만 보이게 처리
const maskEmail = (email) => {
  if (!email) return "-";
  const [local, domain] = email.split("@");

  if (!domain) return email; // 혹시 @ 없는 경우 그대로 리턴

  const visible = local.slice(0, 2);
  const hiddenCount = Math.max(0, local.length - 2); // 음수 방지
  return `${visible}${"*".repeat(hiddenCount)}@${domain}`;
  // abcd123@gmail.com → ab*****@gmail.com
  // a@gmail.com → a*@gmail.com
  // ab@gmail.com → ab@gmail.com (마스킹 없음)
};

  if (loading) {
    return (
      <>
        <Header />
        <div className="admin-loading">로딩 중...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="admin-page__container">
        <h2 className="admin-page__title">유저 관리</h2>
        <table className="admin-page__table">
          <thead>
            <tr>
              <th>아이디</th>
              <th>이름</th>
              <th>이메일</th>
              <th>상태</th>
              <th>잠금 해제</th>
              <th>역할 부여</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId}>
                {/* 아이디 */}
                <td>{u.userId}</td>

                {/* 이름 */}
                <td>{maskName(u.name)}</td>

                {/* 이메일 */}
                <td>{maskEmail(u.email)}</td>

                {/* 상태 */}
                <td>
                  <span
                    className={`status-badge ${u.accountLocked ? 'status-locked' : 'status-normal'}`}
                  >
                    {u.accountLocked ? '잠김' : '정상'}
                  </span>
                </td>

                {/* 잠금 해제 */}
                <td>
                  {u.accountLocked && (
                    <button
                      onClick={() => handleUnlock(u.email)}
                      className="admin-btn admin-btn--unlock"
                    >
                      Unlock
                    </button>
                  )}
                </td>

                {/* 역할 */}
                <td>
                  <select
                    defaultValue={u.role}
                    onChange={(e) => handleAssignRole(u.userId, e.target.value)}
                    className="admin-select"
                    disabled={u.role === 'ADMIN'}
                  >
                    {u.role === "ADMIN" && <option value="ADMIN">ADMIN</option>}
                    <option value="USER">USER</option>
                    <option value="PLANNER">PLANNER</option>
                    <option value="DEVELOPER">DEVELOPER</option>
                    <option value="PUBLISHER">PUBLISHER</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <Footer />
    </>
  );
};

export default AdminUserManagePage;
