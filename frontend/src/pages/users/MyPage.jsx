import React, { useEffect, useState } from 'react'
import { getMyPageInfo } from '../../api/users'


const MyPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  // const [editMode, setEditMode] = useState(false);

  useEffect(()=>{
    const data = async() => {
      try {
        const data = await getMyPageInfo();
        setUserInfo(data);
      }catch (err) {
        console.error('마이페이지 정보 조회 실패', err)
      }
    };

    data();
  }, []);

return (
    <div className="mx-auto p-8 bg-white ">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-20">마이페이지</h2>

      <div className="max-w-2xl space-y-4 p-6 bg-gray-50 rounded-lg shadow-sm">
      {userInfo ? (
        <div className="space-y-4 text-gray-700">
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-600">이름</span>
            <span>{userInfo.userName}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-600">이메일</span>
            <span>{userInfo.email}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-600">역할</span>
            <span>{userInfo.role}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">참여 프로젝트</span>
            <span>{(userInfo.participatingProjects?.length ?? 0)}</span> {/* 비어있을 경우 0 표시 */}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center">정보를 불러오는 중...</p>
      )}
      </div>
      
    </div>
  );

}

export default MyPage