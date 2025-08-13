import React, { useState as useStateSignUp } from 'react';
import { useNavigate as useNavigateSignUp, Link as LinkSignUp } from 'react-router-dom';
import { signup as apiSignup } from '../api/auth.js';
import TermsPage from './TermsPage.jsx';

const SignUp = () => {
  // 기본 회원 정보
  const [name, setName] = useStateSignUp('');
  const [email, setEmail] = useStateSignUp('');
  const [password, setPassword] = useStateSignUp('');
  const [confirmPassword, setConfirmPassword] = useStateSignUp('');
  const [company, setCompany] = useStateSignUp('');

  // 약관 동의 상태
  const [agreedToTerms, setAgreedToTerms] = useStateSignUp(false);
  const [showTerms, setShowTerms] = useStateSignUp(false);

  // 상태
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
      // agreedToTerms 포함해서 전송
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

            <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)}
              required className="w-full px-3 py-2 border border-gray-300 rounded-md" />

            <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)}
              required className="w-full px-3 py-2 border border-gray-300 rounded-md" />

            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)}
              required className="w-full px-3 py-2 border border-gray-300 rounded-md" />

            <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required className="w-full px-3 py-2 border border-gray-300 rounded-md" />

            <p className="text-sm text-gray-500">
              비밀번호는 최소 8자 이상, 숫자/영문/특수문자를 포함하여 구성할 수 있습니다.
            </p>
            {confirmPassword && (
              <p className={`text-sm ${password === confirmPassword ? "text-green-500" : "text-red-500"}`}>
                {password === confirmPassword ? "✅ 비밀번호가 일치합니다" : "❌ 비밀번호가 일치하지 않습니다"}
              </p>
            )}

            <input type="text" placeholder="회사명" value={company} onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" />

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={agreedToTerms}
                readOnly
                className="hidden"
              />
              <div className={`w-5 h-5 rounded border border-gray-300 flex items-center justify-center
                ${agreedToTerms ? "bg-teal-400" : "bg-gray-200"}
                ${!agreedToTerms ? "opacity-50" : ""}`}>
                {agreedToTerms && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span>약관에 동의합니다.</span>
              <button type="button" className="text-blue-500 underline" onClick={() => setShowTerms(true)}>보기</button>
            </label>

            <button type="submit" disabled={isLoading}
              className="w-full bg-teal-400 text-white py-2 rounded-md hover:bg-teal-500 disabled:bg-gray-400">
              {isLoading ? '가입 중...' : '가입하기'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <LinkSignUp to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                로그인
              </LinkSignUp>
            </p>
          </div>
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
  );
};

export default SignUp;
