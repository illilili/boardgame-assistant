import React, { useState as useStateLogin } from 'react';
import { useNavigate as useNavigateLogin, Link as LinkLogin } from 'react-router-dom';
import { login as apiLogin } from '../api/auth.js';
import { jwtDecode } from 'jwt-decode';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useStateLogin('');
  const [password, setPassword] = useStateLogin('');
  const [error, setError] = useStateLogin('');
  const [isLoading, setIsLoading] = useStateLogin(false);
  const navigate = useNavigateLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await apiLogin({ email, password });
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);

      const decoded = jwtDecode(result.accessToken);
      if (decoded.role) localStorage.setItem('role', decoded.role);
      if (decoded.name) localStorage.setItem('name', decoded.name);

      alert('로그인 성공!');
      window.dispatchEvent(new Event("storage"));
      navigate('/');
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">로그인</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <input
              type="email"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />

            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="login-footer">
            계정이 없으신가요?{' '}
            <LinkLogin to="/signup">회원가입</LinkLogin>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
