import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectDetail, getProjectMembers, getProjectRecentLogs } from '../api/project';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import { ProjectContext } from '../contexts/ProjectContext';
import './ProjectHomePage.css'; // 오렌지 테마 스타일 반영

const DEFAULT_THUMBNAIL = 'https://boardgame-assistant.s3.ap-northeast-2.amazonaws.com/thumbnails/%EC%95%84%EC%B9%B4%EC%9E%90.png';

const ProjectHomePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectInfo, setProjectInfo] = useState({});
  const [status, setStatus] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [members, setMembers] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const getProgressFromStatus = (status) => {
    switch (status) {
      case 'PLANNING': return 15;
      case 'REVIEW_PENDING': return 30; // 기획안 제출 후 승인 대기
      case 'DEVELOPMENT': return 60;
      case 'PUBLISHING': return 85;
      case 'COMPLETED': return 100;
      default: return 0;
    }
  };

  useEffect(() => {
    if (!projectId) return;

    Promise.all([
      getProjectDetail(projectId),
      getProjectMembers(projectId),
      getProjectRecentLogs(projectId)
    ])
      .then(([detailData, membersData, logsData]) => {
        setProjectInfo(detailData);
        setStatus(detailData.status);
        setProgress(getProgressFromStatus(detailData.status));
        setProjectName(detailData.projectName);
        setMembers(membersData);
        setRecentLogs(logsData);
      })
      .catch(err => {
        console.error("프로젝트 정보 로딩 실패:", err);
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
      <Header projectMode={true} />
      <div className="workspace-container new-design">

        {/* ===== 사이드바 ===== */}
        <aside className="workspace-sidebar">
          <div className="sidebar-header">
          </div>
          <ul className="workspace-nav-list">
            <li
              className="nav-item"
              onClick={() => navigate(`/projects/${projectId}/plan`)}
            >
              PLAN
            </li>
            <li
              className="nav-item"
              onClick={() => navigate(`/projects/${projectId}/development`)}
            >
              DEVELOP
            </li>
            <li
              className="nav-item"
              onClick={() => navigate(`/projects/${projectId}/publish`)}
            >
              PUBLISH
            </li>
          </ul>
        </aside>

        {/* ===== 메인 컨텐츠 ===== */}
        <main className="workspace-main-content">
          {/* 프로젝트 제목 & 진행률 */}
          <div className="project-home-header">
            <div className="project-info">
              <h2>{projectName}</h2>
              <p className="project-description">여기에 프로젝트 한 줄 설명이 들어갑니다.</p>
              <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>

              {/* 진행률 */}
              <div className="progress-container" style={{ marginTop: '10px' }}>
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                <span>{progress}%</span>
              </div>
            </div>
            <div className="project-thumbnail-wrapper">
              <img
                src={projectInfo.thumbnailUrl || DEFAULT_THUMBNAIL}
                alt={`${projectInfo.projectName} 썸네일`}
                className="project-home-thumbnail"
              />
            </div>
          </div>

          {/* 멤버 목록 */}
          <div className="info-card">
            <h2>멤버 목록</h2>
            <ul className="member-list">
              {members.map((m, idx) => (
                <li key={idx} className="member-item">
                  <span className="member-role">{m.role}</span>
                  <span className="member-name">{m.userName}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* 최근 작업 */}
          <div className="info-card">
            <h2>최근 작업</h2>
            <ul className="log-list">
              {recentLogs.map(log => (
                <li key={log.id} className="log-item">
                  <span className="log-action">{log.action}</span>
                  <span className="log-user">{log.username}</span>
                  <span className="log-date">{new Date(log.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
      <Footer />
    </ProjectContext.Provider>
  );
};

export default ProjectHomePage;
