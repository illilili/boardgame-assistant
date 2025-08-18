import React, { useState as useStateSignUp } from 'react';
import { useNavigate as useNavigateSignUp, Link as LinkSignUp } from 'react-router-dom';
import { signup as apiSignup } from '../api/auth.js';

const SignUp = () => {
    const [name, setName] = useStateSignUp('');
    const [email, setEmail] = useStateSignUp('');
    const [password, setPassword] = useStateSignUp('');
    const [company, setCompany] = useStateSignUp('');
    const [role, setRole] = useStateSignUp('USER'); // 역할 상태 추가, 기본값 'USER'
    const [error, setError] = useStateSignUp('');
    const [isLoading, setIsLoading] = useStateSignUp(false);
    const navigate = useNavigateSignUp();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // API로 보낼 데이터에 role 추가
            await apiSignup({ name, email, password, company, role });
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700">이름</label>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">이메일 주소</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">회사 (선택)</label>
                            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        {/* 역할 선택 드롭다운 추가 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">역할</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="USER">일반 사용자</option>
                                <option value="PLANNER">기획자</option>
                                <option value="DEVELOPER">개발자</option>
                                <option value="PUBLISHER">퍼블리셔</option>
                            </select>
                        </div>
                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                                {isLoading ? '가입 중...' : '가입하기'}
                            </button>
                        </div>
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
        </div>
    );
};
export default SignUp;