import React, { useState, useEffect } from 'react';
import { signup } from '../../api/auth.js';
import { useNavigate } from "react-router-dom";
import TermsPage from './TermsPage.jsx';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [company, setCompany] = useState('');

  //동의관련
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }

    if (!agreedToTerms) {
      alert('약관에 동의해주세요.');
      return;
    }

    const formData = {
      name,
      email,
      password,
      company,
      agreedToTerms,
    };

    try {
      const result = await signup(formData);
      console.log('응답 데이터:', result);
      alert(result.message);
    } catch (err) {
      alert('회원가입에 실패했습니다.');
      console.error(err.response?.data || err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-6">회원가입</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="text-sm text-gray-500 mb-2">  비밀번호는 최소 8자 이상, 숫자/영문/특수문자를 포함하여 구성할 수 있습니다.</p>
        {confirmPassword && (
        <p className={`text-sm ${password === confirmPassword ? "text-green-500" : "text-red-500"}`}>
          {password === confirmPassword
            ? "✅ 비밀번호가 일치합니다 "
            : "❌ 비밀번호가 일치하지 않습니다 "}
        </p>
      )}
        <input
          type="text"
          placeholder="회사명"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* 약관 체크 */}
        <label>
          <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
        />
        약관에 동의합니다.{' '}
          <button
            type="button"
            className="text-blue-500 underline"
            onClick={() => setShowTerms(true)}
          >
            보기
          </button>
        </label>
            

        <button
          type="submit"
          className="w-full bg-teal-400 text-white py-2 rounded-md hover:bg-teal-500 transition-colors"
        >
          가입하기
        </button>
      </form>

      {/* 모달 컴포넌트 */}
      <TermsPage isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default SignUp;
