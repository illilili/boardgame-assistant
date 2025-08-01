import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';

import MyPage from './pages/users/MyPage'

function App() {
    return (
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="/mypage" element={<MyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
