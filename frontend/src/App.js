import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './layout/MainLayout';

import MyPage from './pages/users/MyPage'
import Profile from './pages/users/Profile';

import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';
import PrivacyPolicy from './pages/auth/PrivacyPolicy';
import AuthRoute from './pages/auth/AuthRoute';
import LandingPage from './pages/auth/LandingPage';

import AdminUserManagePage from './pages/admin/UserManagePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 안 된 경우 보여줄 페이지 */}
        <Route path="/landing" element={<LandingPage />} />

        {/* 로그인 여부에 따라 MainLayout을 보여줄지 결정 */}
        <Route path="/" 
          element={
            <AuthRoute>
              <MainLayout />
            </AuthRoute>
          }
        >
          <Route path="mypage" element={<MyPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="/admin/users" element={<AdminUserManagePage />} />
        </Route>

        {/* 독립적인 페이지들 */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
