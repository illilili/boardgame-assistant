// src/admin/AdminHomePage.jsx
import React, { useState } from 'react';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import AdminUserManagePage from './UserManagePage';
import AdminProjectManagePage from './ProjectManagePage';
import './AdminHomePage.css';

export default function AdminHomePage() {
  const [view, setView] = useState('user'); // 기본은 유저 관리

  return (
    <>
      <Header />
      <div className="admin-nav">
        <div
          className={`admin-tab ${view === 'user' ? 'active' : ''}`}
          onClick={() => setView('user')}
        >
          회원 관리
        </div>
        <div
          className={`admin-tab ${view === 'project' ? 'active' : ''}`}
          onClick={() => setView('project')}
        >
          프로젝트 관리
        </div>
      </div>

      <div className="admin-content">
        {view === 'user' && <AdminUserManagePage />}
        {view === 'project' && <AdminProjectManagePage />}
      </div>
      <Footer />
    </>
  );
}
