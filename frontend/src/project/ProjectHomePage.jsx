import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectDetail, getProjectMembers, getProjectRecentLogs } from '../api/project';
import Header from '../mainPage/Header';
import Footer from '../mainPage/Footer';
import { ProjectContext } from '../contexts/ProjectContext';
import './ProjectHomePage.css'; 

// ✨ 아이콘 추가
import { FaHome, FaUserCircle, FaPen, FaBoxOpen, FaFlagCheckered } from 'react-icons/fa';

const DEFAULT_THUMBNAIL = 'https://boardgame-assistant.s3.ap-northeast-2.amazonaws.com/thumbnails/%EC%95%84%EC%B9%B4%EC%9E%90.png';

// ✨ 로그 액션에 따른 아이콘을 반환하는 함수
const getLogIcon = (action) => {
    if (action.includes('생성')) return <FaPen className="log-icon create" />;
    if (action.includes('수정')) return <FaPen className="log-icon update" />;
    if (action.includes('제출')) return <FaFlagCheckered className="log-icon submit" />;
    return <FaBoxOpen className="log-icon default" />;
};

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
            case 'REVIEW_PENDING': return 30;
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
            <div className="workspace-container">
                <aside className="workspace-sidebar">
                    <nav className="workspace-nav">
                        <div className="nav-item active" onClick={() => navigate(`/projects/${projectId}`)}><FaHome /> 홈</div>
                        <div className="nav-item" onClick={() => navigate(`/projects/${projectId}/plan`)}>PLAN</div>
                        <div className="nav-item" onClick={() => navigate(`/projects/${projectId}/development`)}>DEVELOP</div>
                        <div className="nav-item" onClick={() => navigate(`/projects/${projectId}/publish`)}>PUBLISH</div>
                    </nav>
                </aside>

                <main className="workspace-main">
                    <div className="project-header-card">
                        <div className="project-header-content">
                            <span className={`status-badge status-${status.toLowerCase()}`}>{status.replace('_', ' ')}</span>
                            <h1>{projectName}</h1>
                            <p className="project-description">{projectInfo.description || "프로젝트 한 줄 설명이 여기에 표시됩니다."}</p>
                            
                            <div className="progress-wrapper">
                                <div className="progress-bar-background">
                                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                                </div>
                                <span className="progress-percentage">{progress}%</span>
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

                    <div className="workspace-grid">
                        <div className="info-card">
                            <h2>멤버 ({members.length})</h2>
                            <ul className="member-list">
                                {members.map((m, idx) => (
                                    <li key={idx} className="member-item">
                                        <FaUserCircle className="member-avatar" />
                                        <div className="member-info">
                                            <span className="member-name">{m.userName}</span>
                                            <span className="member-role">{m.role}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="info-card">
                            <h2>최근 활동</h2>
                            <ul className="log-list">
                                {recentLogs.map(log => (
                                    <li key={log.id} className="log-item">
                                        {getLogIcon(log.action)}
                                        <div className="log-details">
                                            <span className="log-message">
                                                <span className="log-user">{log.username}</span>님이 <span className="log-action">{log.action}</span>
                                            </span>
                                            <span className="log-date">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </ProjectContext.Provider>
    );
};

export default ProjectHomePage;