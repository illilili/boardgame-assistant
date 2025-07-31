import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './layout/MainLayout';
import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* layout이 필요한 일반 페이지들 */}
        <Route path="/" element={<MainLayout />}>
          {/* 여기에 Outlet으로 들어갈 하위 페이지들 */}
        </Route>

        {/* layout 없이 보여야 하는 독립적인 페이지들 */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
