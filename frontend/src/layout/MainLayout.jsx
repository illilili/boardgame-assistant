import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
        <main className="flex-1 bg-white p-6 flex items-center justify-center">
        {/* 가운데 사각형 */}
         <div className="bg-white rounded-2xl shadow-lg w-full max-w-6xl p-8 border border-gray-300 mt-[10vh] min-h-[80vh]"> {/* //mt-[10vh] = 위에 얼만큼 비워놓을건지*/}
            <Outlet />
        </div>
        </main>

    </div>
  );
}