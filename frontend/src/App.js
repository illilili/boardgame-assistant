import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './layout/MainLayout';

import MyPage from './pages/users/MyPage'
import Profile from './pages/users/Profile';
import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';
import PrivacyPolicy from './pages/auth/PrivacyPolicy';

function App() {
    return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* layout 없이 보여야 하는 독립적인 페이지들 */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />  
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
