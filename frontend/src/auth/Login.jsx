import React, { useState as useStateLogin } from 'react';
import { useNavigate as useNavigateLogin, Link as LinkLogin } from 'react-router-dom';
import { login as apiLogin } from '../api/auth.js';

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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    로그인
                </h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 주소</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">비밀번호</label>
                            <div className="mt-1">
                                <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>
                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                                {isLoading ? '로그인 중...' : '로그인'}
                            </button>
                        </div>
                    </form>
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">계정이 없으신가요?</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <LinkLogin to="/signup" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                회원가입
                            </LinkLogin>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Login;
