import React, { useEffect, useState } from 'react';
import { fetchAllUsers, unlockUser, assignRole } from '../../api/admin';
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 추가

const Admin = () => { // 더 이상 token prop을 받지 않습니다.
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 페이지 이동을 위해 navigate 훅 사용

  // 컴포넌트 내부에서 직접 localStorage의 토큰을 가져옵니다.
  const token = localStorage.getItem('accessToken');

  // 사용자 목록을 불러오는 함수
  const loadUsers = async () => {
    try {
      // fetchAllUsers 함수는 API 클라이언트(예: axios)의 인터셉터 등을 통해
      // 자동으로 토큰을 헤더에 추가하여 요청할 것으로 예상됩니다.
      const response = await fetchAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('유저 불러오기 실패:', error);
      alert('사용자 목록을 불러오는 데 실패했습니다. 다시 로그인해주세요.');
      navigate('/login'); // 실패 시 로그인 페이지로 이동
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 컴포넌트가 마운트될 때 토큰 존재 여부를 먼저 확인합니다.
    if (!token) {
      alert('관리자 권한이 필요합니다. 로그인 페이지로 이동합니다.');
      setLoading(false);
      navigate('/login'); // 토큰이 없으면 로그인 페이지로 리디렉션
      return; // 이후 코드 실행 방지
    }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // useEffect는 처음 한 번만 실행되도록 설정

  // 계정 잠금 해제 처리 함수
  const handleUnlock = async (email) => {
    try {
      // unlockUser 함수에 직접적인 토큰 전달이 필요하다면, 여기서 가져온 토큰을 사용합니다.
      // 만약 API 클라이언트가 자동으로 토큰을 처리한다면 이 인자는 필요 없을 수 있습니다.
      await unlockUser(email, token);
      alert(`${email} 계정이 잠금 해제되었습니다.`);
      loadUsers(); // 목록 새로고침
    } catch (error) {
      console.error('잠금 해제 실패:', error);
      alert('계정 잠금 해제에 실패했습니다.');
    }
  };

  // 역할 배정 함수
  const handleAssignRole = async (userId, newRole) => {
    if (!newRole) return alert("역할을 선택해주세요!");

    try {
      const res = await assignRole(userId, newRole);
      alert(res.data.message);
      loadUsers(); // 목록 새로고침
    } catch (error) {
      console.error('역할 부여 실패:', error);
      alert(error.response?.data?.message || "역할 부여에 실패했습니다.");
    }
  };
  
  // 로딩 중이거나 토큰이 없을 때의 UI 처리
  if (loading) {
    return <div className="text-center mt-20">로딩 중...</div>;
  }
  
  // 실제 렌더링 부분
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">관리자 유저 관리</h2>
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 border-b">이메일</th>
            <th className="py-2 px-4 border-b">아이디</th>
            <th className="py-2 px-4 border-b">상태</th>
            <th className="py-2 px-4 border-b">잠금 해제</th>
            <th className="py-2 px-4 border-b">역할 부여</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userId} className="text-center hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{u.email}</td>
              <td className="py-2 px-4 border-b">{u.userId}</td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.accountLocked ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                  {u.accountLocked ? '잠김' : '정상'}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                {u.accountLocked && (
                  <button onClick={() => handleUnlock(u.email)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                    Unlock
                  </button>
                )}
              </td>
              <td className="py-2 px-4 border-b">
                <select
                  defaultValue={u.role}
                  onChange={(e) => handleAssignRole(u.userId, e.target.value)}
                  className="border rounded p-1"
                  disabled={u.role === 'ADMIN'} // 관리자 역할은 변경 불가
                >
                  {/* 현재 역할이 ADMIN일 경우, 옵션에 비활성화된 상태로 보여주기 위함 */}
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
    </div>
  );
};

export default Admin;