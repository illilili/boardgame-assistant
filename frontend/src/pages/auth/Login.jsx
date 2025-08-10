import React, {useState}from 'react'
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth.js';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async(e)=>{
        e.preventDefault();

        const formData = {
            email,
            password,
        };

        try {
            const result = await login(formData);
            // 로그인 성공 시 토큰 저장 - 저장하지 않으면 새로고침시 풀린다고 해서..
            localStorage.setItem('accessToken', result.accessToken);
            localStorage.setItem('refreshToken', result.refreshToken);
            localStorage.setItem('role', result.role);

            alert('로그인 성공');
            navigate('/'); // 로그인 후 메인 페이지 등으로 이동
            } catch (err) {
            const message = err.response?.data?.message;
            alert(message || '로그인에 실패했습니다.');
            console.error(err);
          }
    };

  return (
    <div className='max-w-md mx-auto mt-10 p-6 bg-white rounded-md shadow-md'>
      <h2 className="text-2xl font-semibold text-center mb-6">로그인</h2>
     <form onSubmit={handleSubmit} className="space-y-4">
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
      <button 
       type="submit"
       className="w-full bg-teal-400 text-white py-2 rounded-md hover:bg-teal-500 transition-colors">로그인</button>
    </form>
    </div>
  )
}

export default Login