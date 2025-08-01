import React, { useState } from 'react'
import { signup } from '../../api/auth.js';


const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async(e)=>{
        e.preventDefault();

        if(password != confirmPassword){
            alert('비밀번호가 일치하지 않습니다');
            return;
        }

        const formData = {
            name,
            email,
            password,
            confirmPassword
        };

        try {
            const result = await signup(formData);
            alert(result.message); //response에서 메시지만 꺼내 출력.
            } catch (err){
                alert('회원가입에 실패했습니다.');
                console.error(err);
            }
    };


  return (
    <div className='max-w-md mx-auto mt-10 p-6 bg-white rounded-md shadow-md'>
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
      <button 
       type="submit"
       className="w-full bg-teal-400 text-white py-2 rounded-md hover:bg-teal-500 transition-colors">가입하기</button>
    </form>
    </div>
  )
}

export default SignUp