// src/layouts/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { AiFillHome } from 'react-icons/ai'; //홈 버튼
import { FaUserCircle } from 'react-icons/fa';
import { FiMoreHorizontal } from 'react-icons/fi';

// api import
import { logout } from '../api/auth.js';

// 사이드바 아이템 임시 
const navItems = [
  { label: '홈', path: '/' },
  { label: '임시메뉴1', path: '/login' }, //해당페이지없어서 클릭시 당연히 오류발생함.
];

// 예시: 유저 정보 가정
const user = {
  name: '김에이블',
  avatar: '',
};


export default function Sidebar() {
  const location = useLocation();

  //로그아웃 핸들러
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const result = await logout();
      alert(result.message); // "로그아웃 되었습니다."
      // 토큰 및 권한 정보 제거 - 추후 보고 삭제하거나 조정필요할듯
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      // 리디렉션
      window.location.href = '/login';
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <aside className="w-80 bg-gray-100 border-r border-gray-300 shadow-lg p-4 flex flex-col h-screen">

    {/* 상단 워크스페이스 */}
    <div>
    <Link to="/" className="flex items-center gap-2 mb-4 px-4 py-2 rounded hover:text-teal-500 font-semibold" >
    <AiFillHome size={20} /></Link>

      <h1 className="text-xl font-bold mb-6 text-center"> [기획] 워크스페이스 </h1>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-2 rounded hover:bg-teal-100 ${ //hover제거할 수도 있음.
              location.pathname === item.path ? 'text-teal-500 font-semibold' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      </div>

      {/* 하단 - 유저 메뉴 */}
      <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-gray-300  ">
        <div className="flex justify-between items-center px-4 py-2">
        {/* 프로필 + 환영문구 묶음 */}
        <div className="flex items-center gap-3">
            {user.avatar ? (
            <img
                src={user.avatar}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
            />
            ) : (
            <FaUserCircle size={40} className="text-gray-500" />
            )}
            <div className="flex flex-col">
            <span className="text-sm font-semibold">{user.name} 님</span>
            <span className="text-xs text-gray-500">환영합니다!</span>
            </div>
        </div>

        {/* 마이페이지 점 세개 */}
        <Link to="/mypage" className="text-gray-600 hover:text-teal-500">
        <FiMoreHorizontal size={18} />
        </Link>
        </div>


        {/* 로그아웃 */}
        <button onClick={handleLogout} className="px-4 py-2 rounded hover:bg-red-100 text-red-500 font-semibold">
         로그아웃
        </button>

      </div>
    </aside>
  );
}
