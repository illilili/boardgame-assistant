// DeveloperInfo.jsx - 퍼블리셔가 개발자 정보를 조회하는 기능
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getDevelopInfo } from '../../api/users.js';

const DeveloperInfo = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // JWT 토큰에서 role 확인 함수
  const getUserRoleFromToken = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch (error) {
      console.error('토큰 디코딩 실패:', error);
      return null;
    }
  };

  // PUBLISHER 권한 확인
  const isPublisher = () => {
    return getUserRoleFromToken() === 'PUBLISHER';
  };

  const hasPermission = isPublisher();

  useEffect(() => {
    // PUBLISHER가 아니면 API 호출하지 않음
    if (!hasPermission) return;

    const fetchDevelopers = async () => {
      setLoading(true);
      try {
        const data = await getDevelopInfo();
        setDevelopers(data);
      } catch (err) {
        setError(err.response?.status === 403 ? 
          '접근 권한이 없습니다.' : 
          '개발자 목록을 불러오는데 실패했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, [hasPermission]);

  // PUBLISHER가 아닌 경우 접근 차단
  if (!hasPermission) {
    return (
      <div className="access-denied">
        <h3>접근 권한이 없습니다</h3>
        <p>이 페이지는 PUBLISHER 권한이 있는 사용자만 접근할 수 있습니다.</p>
      </div>
    );
  }

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="error">에러: {error}</div>;

  return (
    <div className="developer-list">
      <h2>개발자 목록</h2>
      {developers.length === 0 ? (
        <p>등록된 개발자가 없습니다.</p>
      ) : (
        <div className="developer-grid">
          {developers.map((developer) => (
            <div key={developer.userId} className="developer-card">
              <p>이름:  {developer.name}</p>
              <p>이메일: {developer.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeveloperInfo;