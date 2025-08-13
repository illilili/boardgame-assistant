import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
      <main className="project-home-container">
        <div className="project-home-card">
          <div className="project-home-header">
            <h1>프로젝트 #{projectId}</h1>
            <button
              className="primary-button"
              onClick={() => navigate(`/project/${projectId}/rename`)}
            >
              이름 수정
            </button>
          </div>
          <p className="project-status">현재 상태: {status}</p>

          <div className="link-list">
            <Link to={`/projects/${projectId}/plan`} className="link-button plan">기획 페이지로 이동</Link>
            <Link to={`/projects/${projectId}/development`} className="link-button dev">개발 페이지로 이동</Link>
            <Link to={`/projects/${projectId}/publish`} className="link-button publish">퍼블리시 페이지로 이동</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProjectHomePage;
