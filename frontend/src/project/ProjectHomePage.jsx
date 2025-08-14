import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProjectStatus } from '../api/project';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import Plan from '../plan/Plan';
import { ProjectContext } from '../contexts/ProjectContext';
import './ProjectHomePage.css';

/**
 * 프로젝트의 메인 허브 역할을 하는 페이지입니다.
 * URL에서 projectId를 가져와 Context를 통해 모든 하위 기획 컴포넌트에게 제공합니다.
 */
const ProjectHomePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    if (!projectId) return;

    getProjectStatus(projectId)
      .then(data => {
        setStatus(data.status || data);
        setProjectName(`프로젝트 #${projectId}`); // 임시 이름 설정
      })
      .catch(err => {
        console.error("프로젝트 상태 로딩 실패:", err);
        navigate('/projects');
      });
  }, [projectId, navigate]);

  if (!status) {
    return (
      <>
        <Header />
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>로딩 중...</div>
        <Footer />
      </>
    );
  }

  return (
    <ProjectContext.Provider value={{ projectId }}>
      <Header />
      <main className="project-home-container">
        <div className="project-home-card">
          <div className="project-home-header">
            <h1>{projectName}</h1>
            <div className="header-controls">
              <p className="project-status">현재 상태: {status}</p>
              <button
                className="primary-button"
                onClick={() => navigate(`/project/${projectId}/rename`)}
              >
                이름 수정
              </button>
            </div>
          </div>

          <div className="planning-section-container">
            <Plan />
          </div>

          <div className="link-list">
            <Link to={`/projects/${projectId}/development`} className="link-button dev">개발 페이지로 이동</Link>
            <Link to={`/projects/${projectId}/publish`} className="link-button publish">퍼블리시 페이지로 이동</Link>
          </div>
        </div>
      </main>
      <Footer />
    </ProjectContext.Provider>
  );
};

export default ProjectHomePage;
