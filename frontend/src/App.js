import { RouterProvider } from "react-router-dom";
import './App.css';
import router from './router'

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './layout/MainLayout';

import MyPage from './pages/users/MyPage'
import Profile from './pages/users/Profile';
import DeveloperInfo from './pages/users/DeveloperInfo';

import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';
import PrivacyPolicy from './pages/auth/PrivacyPolicy';
import AuthRoute from './pages/auth/AuthRoute';
import LandingPage from './pages/auth/LandingPage';

import AdminUserManagePage from './pages/admin/UserManagePage';

function App() {
  return (
    <div className="App">
      <RouterProvider router={router}/>
    </div>
  );
}


export default App;
