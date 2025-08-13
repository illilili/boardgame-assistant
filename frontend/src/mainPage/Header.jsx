// src/components/Header.js
import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth.js';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('role');
    setIsLoggedIn(!!token);
    setRole(userRole);
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const result = await logout();
      alert(result.message);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      setIsLoggedIn(false);
      setRole(null);
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <header className="minimalist-header">
      <div className="logo-minimalist">BOARD.CO</div>
      <nav className="main-nav">
        {/* 로그인 안 한 경우 */}
        {!isLoggedIn && (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </>
        )}

        {/* 로그인 한 경우 */}
        {isLoggedIn && (
          <>
            <Link to="/trend">트렌드분석</Link>
            <Link to="/projects">프로젝트</Link>
            <Link to="/mypage">마이페이지</Link> 

            {/* 관리자 */}
            {role && role.toUpperCase().includes('ADMIN') && (<Link to="/user-manage">회원관리</Link>)}

            {/* 퍼블리셔 */}
            {role === 'PUBLISHER' && <Link to="/approve-manage">승인관리</Link>}

            <a href="/" onClick={handleLogout}>로그아웃</a>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
