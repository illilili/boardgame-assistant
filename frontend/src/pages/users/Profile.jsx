//  프로필 정보 수정, 프로필 사진 업로드 백엔드에 없어서 주석처리

// import React, { useState } from 'react';
// import axios from 'axios';
// import { uploadProfilePic, editProfile } from '../../api/users';


// const Profile = () => {
//   const [avatarPreview, setAvatarPreview] = useState('');
//   const [avatarFile, setAvatarFile] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [profile, setProfile] = useState({
//     name: '홍길동',
//     bio: '환영합니다!',
//     affiliation: '에이블'
//   });

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setAvatarFile(file);
//       setAvatarPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleChange = (e) => {
//     setProfile({ ...profile, [e.target.name]: e.target.value });
//   };

//     const handleSubmit = async () => {
//     try {
//         const userId = localStorage.getItem('userId'); // 유저 ID 가져오기
//         if (!userId) {
//         alert('로그인이 필요합니다.');
//         return;
//         }

//         let avatarUrl = '';

//         if (avatarFile) {
//         const formData = new FormData();
//         formData.append('profileImage', avatarFile);

//         const res = await uploadProfilePic(userId, formData); 
//         avatarUrl = res.imageUrl;
//         }

//         // 프로필 정보 수정
//         await editProfile(userId, {
//         ...profile,
//         avatar: avatarUrl
//         });

//         alert('프로필이 저장됐습니다!');
//         setIsEditing(false);
//     } catch (err) {
//         console.error(err);
//         alert('수정 중 오류가 발생했습니다');
//     }
// };

//   return (
//     <div className="max-w-3xl mx-auto p-8 ">
//       <h2 className="text-3xl font-bold text-gray-800 text-center mb-20">프로필 설정</h2>

//     <div className="max-w-2xl space-y-4 p-6 bg-gray-50 rounded-lg shadow-sm">
//         {/* 프로필 이미지 */}
//         <div className="mb-10 flex flex-col items-center">
//         <label className="block text-lg font-bold mb-2">프로필 이미지</label>
//         {avatarPreview ? (
//             <img
//             src={avatarPreview}
//             alt="프리뷰"
//             className="w-24 h-24 rounded-full object-cover mb-2"
//             />
//         ) : (
//             <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-2">
//             <span className="text-gray-600">사진 없음</span>
//             </div>
//         )}
//         {isEditing && (
//             <input type="file" accept="image/*" onChange={handleImageChange} />
//         )}
//         </div>

//       {/* 이름 */}
//       <div className="mb-8">
//         <label className="block text-base font-bold mb-1">이름</label>
//         {isEditing ? (
//           <input
//             type="text"
//             name="name"
//             value={profile.name}
//             onChange={handleChange}
//             className="border px-2 py-1 w-full"
//           />
//         ) : (
//           <p>{profile.name}</p>
//         )}
//       </div>

//       {/* 소개글 */}
//       <div className="mb-8">
//         <label className="block text-base font-bold mb-1">소개글</label>
//         {isEditing ? (
//           <textarea
//             name="bio"
//             value={profile.bio}
//             onChange={handleChange}
//             className="border px-2 py-1 w-full"
//           />
//         ) : (
//           <p>{profile.bio}</p>
//         )}
//       </div>

//       {/* 소속 */}
//       <div className="mb-8">
//         <label className="block text-base font-bold mb-1">소속</label>
//         {isEditing ? (
//           <input
//             type="text"
//             name="affiliation"
//             value={profile.affiliation}
//             onChange={handleChange}
//             className="border px-2 py-1 w-full"
//           />
//         ) : (
//           <p>{profile.affiliation}</p>
//         )}
//       </div>

//       {/* 버튼들 */}
//       <div className="flex gap-2">
//         {isEditing ? (
//           <>
//             <button
//               onClick={handleSubmit}
//               className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
//             >
//               저장하기
//             </button>
//             <button
//               onClick={() => setIsEditing(false)}
//               className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
//             >
//               취소
//             </button>
//           </>
//         ) : (
//           <button
//             onClick={() => setIsEditing(true)}
//             className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
//           >
//            수정하기
//           </button>
//         )}
//       </div>
//     </div>
//     </div>
//   );
// };

// export default Profile;
