import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';

import MyPage from './pages/users/MyPage'
import Profile from './pages/users/Profile';

function App() {
    return (
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
