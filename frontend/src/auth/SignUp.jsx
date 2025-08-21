import React, { useState as useStateSignUp } from 'react';
import { useNavigate as useNavigateSignUp, Link as LinkSignUp } from 'react-router-dom';
import { signup as apiSignup } from '../api/auth.js';
import TermsPage from './TermsPage.jsx';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import './SignUp.css';

const SignUp = () => {
  const [name, setName] = useStateSignUp('');
  const [email, setEmail] = useStateSignUp('');
  const [password, setPassword] = useStateSignUp('');
  const [confirmPassword, setConfirmPassword] = useStateSignUp('');
  const [company, setCompany] = useStateSignUp('');

  const [agreedToTerms, setAgreedToTerms] = useStateSignUp(false);
  const [showTerms, setShowTerms] = useStateSignUp(false);

  const [error, setError] = useStateSignUp('');
  const [isLoading, setIsLoading] = useStateSignUp(false);
  const navigate = useNavigateSignUp();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreedToTerms) {
      setError('약관에 동의해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await apiSignup({ name, email, password, company, agreedToTerms });
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="signup-container">
        <div className="signup-card">
          <h2 className="signup-title">회원가입</h2>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="signup-input"
            />

            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="signup-input"
            />

            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="signup-input"
            />

            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="signup-input"
            />

            <p className="input-hint">
              비밀번호는 최소 8자 이상, 숫자/영문/특수문자를 포함해야 합니다.
            </p>

            {confirmPassword && (
              <p
                className={`password-match`}
                style={{
                  color: password === confirmPassword ? 'green' : 'red',
                }}
              >
                {password === confirmPassword
                  ? '✅ 비밀번호가 일치합니다'
                  : '❌ 비밀번호가 일치하지 않습니다'}
              </p>
            )}

            <input
              type="text"
              placeholder="회사명"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="signup-input"
            />

            <label className="terms-label">
              <input
                type="checkbox"
                checked={agreedToTerms}
                readOnly
                style={{ display: 'none' }}
              />
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  background: agreedToTerms ? '#ea580c' : '#e5e7eb',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {agreedToTerms && (
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span>약관에 동의합니다.</span>
              <button
                type="button"
                className="terms-button"
                onClick={() => setShowTerms(true)}
              >
                보기
              </button>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="signup-button"
            >
              {isLoading ? '가입 중...' : '가입하기'}
            </button>
          </form>

          <div className="signup-footer">
            이미 계정이 있으신가요?{' '}
            <LinkSignUp to="/login">로그인</LinkSignUp>
          </div>
        </div>

        <TermsPage
          isOpen={showTerms}
          onClose={() => setShowTerms(false)}
          onAgree={() => {
            setAgreedToTerms(true);
            setShowTerms(false);
          }}
        />
      </div>
      <Footer />
    </>
  );
};

export default SignUp;
