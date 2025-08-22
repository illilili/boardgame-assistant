import React, { useState, useEffect } from 'react';
import './Header.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth.js';

const Header = ({ projectMode = false }) => {
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
      alert(result?.message || "로그아웃 되었습니다.");
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
    <header className={projectMode ? 'project-header' : 'minimalist-header'}>
      <NavLink
        to="/"
        className={projectMode ? 'logo-project' : 'logo-minimalist'}
      >
        BOARD.CO
      </NavLink>

      <nav className={projectMode ? 'project-nav' : 'main-nav'}>
        {!isLoggedIn && (
          <>
            <NavLink to="/login">로그인</NavLink>
            <NavLink to="/signup">회원가입</NavLink>
          </>
        )}

        {isLoggedIn && (
          <>
            <NavLink to="/trend">트렌드분석</NavLink>
            <NavLink to="/projects">프로젝트</NavLink>
            <NavLink to="/mypage">마이페이지</NavLink>

            {role && role.toUpperCase().includes('ADMIN') && (
              <NavLink to="/user-manage">관리자 페이지</NavLink>
            )}
            {role === 'PUBLISHER' && (
              <NavLink to="/plan-review">승인관리</NavLink>
            )}

            <a href="/" onClick={handleLogout}>로그아웃</a>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
