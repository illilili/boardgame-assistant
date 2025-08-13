import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectStatus } from '../api/project';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import './ProjectHomePage.css';

const ProjectHomePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getProjectStatus(projectId)
      .then(data => setStatus(data.status || data))
      .catch(console.error);
  }, [projectId]);

  if (!status) return <div className="p-4">로딩 중...</div>;

  return (
    <>
      <Header />
      <div className="project-home-layout">
        {/* 사이드바 */}
        <aside className="sidebar">
          <h2>메뉴</h2>
          <button onClick={() => navigate(`/projects/${projectId}/plan`)}>기획</button>
          <button onClick={() => navigate(`/projects/${projectId}/development`)}>개발</button>
          <button onClick={() => navigate(`/projects/${projectId}/publish`)}>출판</button>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="main-content">
          <h1>프로젝트 #{projectId}</h1>
          <p>현재 상태: {status}</p>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default ProjectHomePage;
