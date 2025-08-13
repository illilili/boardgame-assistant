import Sidebar from './Sidebar';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-white p-6 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-6xl p-8 border border-gray-300 mt-[10vh] min-h-[80vh]">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}