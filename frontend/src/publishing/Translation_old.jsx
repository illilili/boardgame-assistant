// Translation.jsx 다국어 번역 관리
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Translation.css';

function Translation() {
  const navigate = useNavigate();
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [translationRequests, setTranslationRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 더미 데이터
  useEffect(() => {
    const dummyAssignedProjects = [
      {
        submissionId: 1,
        gameTitle: "할리갈리2",
        status: "DEVELOPER_ASSIGNED",
        assignedDeveloper: { name: "김개발", specialty: "카드게임" },
        gameDetails: {
          theme: "카드 게임",
          playerCount: "2-6명",
          playTime: "15분",
          difficulty: "쉬움",
          rules: "같은 과일이 정확히 5개 나오면 종을 치는 게임",
          goal: "빠른 반응속도로 승리하기"
        },
        translationStatus: "PENDING"
      },
      {
        submissionId: 2,
        gameTitle: "할리갈리22",
        status: "DEVELOPER_ASSIGNED",
        assignedDeveloper: { name: "박코딩", specialty: "보드게임" },
        gameDetails: {
          theme: "전략 게임",
          playerCount: "3-4명",
          playTime: "45분",
          difficulty: "보통",
          rules: "자원을 수집하여 건물을 짓는 게임",
          goal: "가장 많은 점수 획득하기"
        },
        translationStatus: "IN_PROGRESS"
      }
    ];

    const dummyLanguages = [
      { code: 'en', name: '영어', flag: '🇺🇸', priority: 'high' },
      { code: 'ja', name: '일본어', flag: '🇯🇵', priority: 'high' },
      { code: 'zh', name: '중국어', flag: '🇨🇳', priority: 'medium' },
      { code: 'es', name: '스페인어', flag: '🇪🇸', priority: 'medium' },
      { code: 'fr', name: '프랑스어', flag: '🇫🇷', priority: 'low' },
      { code: 'de', name: '독일어', flag: '🇩🇪', priority: 'low' }
    ];

    const dummyTranslationRequests = [
      {
        id: 1,
        submissionId: 1,
        gameTitle: "할리갈리2",
        targetLanguage: { code: 'en', name: '영어', flag: '🇺🇸' },
        status: 'REQUESTED',
        requestedAt: '2024-01-22',
        translator: null,
        progress: 0
      },
      {
        id: 2,
        submissionId: 2,
        gameTitle: "할리갈리22",
        targetLanguage: { code: 'ja', name: '일본어', flag: '🇯🇵' },
        status: 'IN_PROGRESS',
        requestedAt: '2024-01-21',
        translator: { name: '번역가A', rating: 4.8 },
        progress: 65
      }
    ];

    setTimeout(() => {
      setAssignedProjects(dummyAssignedProjects);
      setLanguages(dummyLanguages);
      setTranslationRequests(dummyTranslationRequests);
      setLoading(false);
    }, 500);
  }, []);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleRequestTranslation = (languageCode) => {
    if (!selectedProject) return;

    const language = languages.find(lang => lang.code === languageCode);
    const newRequest = {
      id: Date.now(),
      submissionId: selectedProject.submissionId,
      gameTitle: selectedProject.gameTitle,
      targetLanguage: language,
      status: 'REQUESTED',
      requestedAt: new Date().toISOString().split('T')[0],
      translator: null,
      progress: 0
    };

    setTranslationRequests(prev => [...prev, newRequest]);
    
    // 프로젝트 상태 업데이트
    setAssignedProjects(prev =>
      prev.map(proj =>
        proj.submissionId === selectedProject.submissionId
          ? { ...proj, translationStatus: 'REQUESTED' }
          : proj
      )
    );

    alert(`${language.name} 번역이 요청되었습니다.`);
  };

  const getProjectTranslations = (submissionId) => {
    return translationRequests.filter(req => req.submissionId === submissionId);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'pending';
      case 'REQUESTED': return 'requested';
      case 'IN_PROGRESS': return 'in-progress';
      case 'COMPLETED': return 'completed';
      default: return 'pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return '대기';
      case 'REQUESTED': return '요청됨';
      case 'IN_PROGRESS': return '진행중';
      case 'COMPLETED': return '완료';
      default: return '대기';
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="translation-workspace">
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <div className="logo">BOARD.CO</div>
        </div>
        <ul className="workspace-nav-list">
          <li className="nav-item" onClick={() => navigate('/publishing')}>기획안 제출 목록</li>
          <li className="nav-item" onClick={() => navigate('/developer-assignment')}>개발자 배정</li>
          <li className="nav-item nav-header">번역</li>
          <li className="nav-item" onClick={() => navigate('/translation-review')}>번역 검토</li>
          <li className="nav-item" onClick={() => navigate('/pricing-evaluation')}>가격 평가</li>
          <li className="nav-item" onClick={() => navigate('/final-approval')}>최종 승인</li>
        </ul>
      </aside>

      <main className="workspace-main-content">
        <div className="content-layout">
          <div className="submissions-grid">
            <h4>개발 배정된 게임</h4>
            <div className="game-cards-grid">
              {assignedProjects.map((project) => (
                <div 
                  key={project.submissionId} 
                  className={`game-card ${selectedProject?.submissionId === project.submissionId ? 'selected' : ''}`}
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="game-card-header">
                    <h3 className="game-title">{project.gameTitle}</h3>
                    <span className={`status-badge ${getStatusBadgeClass(project.translationStatus)}`}>
                      대기
                    </span>
                  </div>
                  <div className="game-card-content">
                    <p><strong>테마:</strong> {project.gameDetails.theme}</p>
                    <p><strong>플레이어:</strong> {project.gameDetails.playerCount}</p>
                    <p><strong>플레이 시간:</strong> {project.gameDetails.playTime}</p>
                    <p><strong>난이도:</strong> {project.gameDetails.difficulty}</p>
                    <p className="approval-date"><strong>제출일:</strong> {project.assignedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-panel">
            {!selectedProject ? (
          <div className="welcome-screen">
            <div className="welcome-icon">🌍</div>
            <h2>다국어 번역 관리</h2>
            <p>위 목록에서 게임을 선택하여 번역을 관리하세요.</p>
          </div>
        ) : (
          <div className="translation-content">
            <div className="project-info-section">
              <h2>선택된 게임: {selectedProject.gameTitle}</h2>
              <div className="project-details">
                <div className="detail-group">
                  <p><strong>개발자:</strong> {selectedProject.assignedDeveloper.name}</p>
                  <p><strong>테마:</strong> {selectedProject.gameDetails.theme}</p>
                  <p><strong>플레이어:</strong> {selectedProject.gameDetails.playerCount}</p>
                </div>
                <div className="detail-group">
                  <p><strong>플레이 시간:</strong> {selectedProject.gameDetails.playTime}</p>
                  <p><strong>난이도:</strong> {selectedProject.gameDetails.difficulty}</p>
                </div>
              </div>

              <div className="game-text-content">
                <h3>번역 대상 텍스트</h3>
                <div className="text-item">
                  <label>게임 규칙:</label>
                  <p>{selectedProject.gameDetails.rules}</p>
                </div>
                <div className="text-item">
                  <label>게임 목표:</label>
                  <p>{selectedProject.gameDetails.goal}</p>
                </div>
              </div>
            </div>

            <div className="translation-section">
              <h3>번역 요청</h3>
              <div className="languages-grid">
                {languages.map((language) => {
                  const existingRequest = getProjectTranslations(selectedProject.submissionId)
                    .find(req => req.targetLanguage.code === language.code);
                  
                  return (
                    <div key={language.code} className="language-card">
                      <div className="language-header">
                        <span className="language-flag">{language.flag}</span>
                        <span className="language-name">{language.name}</span>
                        <span className={`priority-badge ${language.priority}`}>
                          {language.priority === 'high' ? '높음' : 
                           language.priority === 'medium' ? '보통' : '낮음'}
                        </span>
                      </div>
                      
                      {existingRequest ? (
                        <div className="translation-status">
                          <div className="status-info">
                            <span className={`status-badge ${getStatusBadgeClass(existingRequest.status)}`}>
                              {getStatusText(existingRequest.status)}
                            </span>
                            {existingRequest.translator && (
                              <p className="translator-info">
                                번역가: {existingRequest.translator.name} ⭐{existingRequest.translator.rating}
                              </p>
                            )}
                          </div>
                          {existingRequest.status === 'IN_PROGRESS' && (
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${existingRequest.progress}%` }}
                              ></div>
                              <span className="progress-text">{existingRequest.progress}%</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button 
                          className="request-translation-btn"
                          onClick={() => handleRequestTranslation(language.code)}
                        >
                          번역 요청
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="translation-requests-section">
              <h3>번역 요청 현황</h3>
              <div className="requests-list">
                {getProjectTranslations(selectedProject.submissionId).length === 0 ? (
                  <p className="no-requests">아직 번역 요청이 없습니다.</p>
                ) : (
                  getProjectTranslations(selectedProject.submissionId).map((request) => (
                    <div key={request.id} className="request-item">
                      <div className="request-header">
                        <span className="language-info">
                          {request.targetLanguage.flag} {request.targetLanguage.name}
                        </span>
                        <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      <div className="request-details">
                        <p>요청일: {request.requestedAt}</p>
                        {request.translator && (
                          <p>번역가: {request.translator.name} ⭐{request.translator.rating}</p>
                        )}
                        {request.status === 'IN_PROGRESS' && (
                          <div className="progress-info">
                            진행률: {request.progress}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

export default Translation;
