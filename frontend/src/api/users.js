// 마이페이지, 유저 관련 

import axios from 'axios';

const BASE_URL = 'https://your.backend.api.com'

// 마이페이지 정보 조회
export const getMyPageInfo = async () =>{
    const response = await axios.get(`${BASE_URL}/api/users/mypage`)
    return response.data
}



/////// 임시 데이터
////////// 임시 - 마이페이지 정보 조회
// export const getMyPageInfo = async () =>{
//     return {
//         "userId": 37,
//         "name": "이규희",
//         "email": "gyuhi@board.ai",
//         "role": "ROLE_DEVELOPER",
//         "planCount": 6,
//         "contentCount": 4
//     }
// }


