import axios from 'axios';

// 백엔드 API주소 - 변경 필요
const BASE_URL = 'http://localhost:4000';

export const signup = async (data)=>{
    const response = await axios.post(`${BASE_URL}/api/signup`, data)
    return response.data
}

export const login = async (data)=>{
    const response = await axios.post(`${BASE_URL}/api/login`, data)
    return response.data
}


//////////////////////// 더미데이터 확인용

////// 회원가입 더미데이터
// export const signup = async (data) => {
//   console.log('더미 회원가입 데이터:', data);

//   // 1초 후 성공 메시지 응답 흉내
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         message: '회원가입이 성공적으로 완료되었습니다. (더미 응답)',
//       });
//     }, 1000);
//   });
// };

////// 로그인 더미데이터
// export const login = async (data) => {
//   console.log('Mock login 요청됨:', data);

//   if (data.email !== 'admin@aivle.co.kr' || data.password !== '1234') {
//     throw new Error('잘못된 로그인 정보');
//   }

//   return {
//     accessToken: 'mockAccessToken123',
//     refreshToken: 'mockRefreshToken456',
//     role: 'ROLE_USER',
//     message: '로그인 성공!',
//   };
// };