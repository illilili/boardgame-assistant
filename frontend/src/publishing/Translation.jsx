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
      { code: 'zh', name: '중국어', flag: '🇨🇳', priority: 'normal' },
      { code: 'de', name: '독일어', flag: '🇩🇪', priority: 'normal' },
      { code: 'fr', name: '프랑스어', flag: '🇫🇷', priority: 'normal' },
      { code: 'es', name: '스페인어', flag: '🇪🇸', priority: 'normal' }
    ];

    const dummyTranslationRequests = [
      {
        submissionId: 1,
        languageCode: 'en',
        languageName: '영어',
        flag: '🇺🇸',
        status: 'COMPLETED',
        translator: '김영어',
        requestDate: '2024-01-15',
        completionDate: '2024-01-22'
      },
      {
        submissionId: 1,
        languageCode: 'ja',
        languageName: '일본어',
        flag: '🇯🇵',
        status: 'IN_PROGRESS',
        translator: '박일본',
        requestDate: '2024-01-18',
        completionDate: null
      },
      {
        submissionId: 2,
        languageCode: 'en',
        languageName: '영어',
        flag: '🇺🇸',
        status: 'PENDING',
        translator: null,
        requestDate: '2024-01-20',
        completionDate: null
      }
    ];

    setTimeout(() => {
      setAssignedProjects(dummyAssignedProjects);
      setLanguages(dummyLanguages);
      setTranslationRequests(dummyTranslationRequests);
      setLoading(false);
    }, 500);
  }, []);

  const requestTranslation = (submissionId, languageCode) => {
    if (!selectedProject) return;

    const language = languages.find(lang => lang.code === languageCode);
    const newRequest = {
      submissionId,
      languageCode,
      languageName: language.name,
      flag: language.flag,
      status: 'PENDING',
      translator: null,
      requestDate: new Date().toISOString().split('T')[0],
      completionDate: null
    };

    setTranslationRequests(prev => [...prev, newRequest]);
    alert(`${language.name} 번역이 요청되었습니다.`);
  };

  const cancelTranslationRequest = (submissionId, languageCode) => {
    setTranslationRequests(prev => 
      prev.filter(req => !(req.submissionId === submissionId && req.languageCode === languageCode))
    );
    alert('번역 요청이 취소되었습니다.');
  };

  const reviewTranslation = (submissionId, languageCode) => {
    navigate(`/translation-review/${submissionId}/${languageCode}`);
  };

  const getTranslationRequestsForProject = (submissionId) => {
    return translationRequests.filter(req => req.submissionId === submissionId);
  };

  const getTranslationStatusClass = (status) => {
    switch(status) {
      case 'PENDING': return 'pending';
      case 'REQUESTED': return 'requested';
      case 'IN_PROGRESS': return 'in-progress';
      case 'COMPLETED': return 'completed';
      default: return 'pending';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'PENDING': return '대기';
      case 'REQUESTED': return '요청됨';
      case 'IN_PROGRESS': return '진행중';
      case 'COMPLETED': return '완료';
      default: return '대기';
    }
  };

  const getRequestStatusText = (status) => {
    return getStatusText(status);
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
          <li className="nav-item" onClick={() => navigate('/pricing-evaluation')}>가격 책정</li>
          <li className="nav-item" onClick={() => navigate('/final-approval')}>최종 승인</li>
        </ul>
      </aside>

      <main className="workspace-main-content">
        <div className="creator-container">
          <div className="form-column">
            <div className="form-section">
              <h2>번역 대기 중인 게임</h2>
              <div className="game-cards-grid">
                {assignedProjects.map(project => (
                  <div 
                    key={project.submissionId}
                    className={`game-card ${selectedProject?.submissionId === project.submissionId ? 'selected' : ''}`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="game-card-header">
                      <h3 className="game-title">{project.gameTitle}</h3>
                      <span className={`status-badge ${project.translationStatus.toLowerCase()}`}>
                        {getStatusText(project.translationStatus)}
                      </span>
                    </div>
                    <div className="game-card-content">
                      <p><strong>개발자:</strong> {project.assignedDeveloper.name}</p>
                      <p><strong>전문분야:</strong> {project.assignedDeveloper.specialty}</p>
                      <p><strong>테마:</strong> {project.gameDetails.theme}</p>
                      <p><strong>플레이어:</strong> {project.gameDetails.playerCount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="result-column">
            {selectedProject ? (
              <div className="translation-management">
                <div className="selected-game-info">
                  <h3>{selectedProject.gameTitle}</h3>
                  <p><strong>개발자:</strong> {selectedProject.assignedDeveloper.name}</p>
                  <p><strong>현재 상태:</strong> {getStatusText(selectedProject.translationStatus)}</p>
                </div>

                <div className="language-selection">
                  <h4>번역 언어 선택</h4>
                  <div className="language-grid">
                    {languages.map(lang => (
                      <div key={lang.code} className="language-card">
                        <div className="language-header">
                          <span className="flag">{lang.flag}</span>
                          <span className="language-name">{lang.name}</span>
                          <span className={`priority ${lang.priority}`}>
                            {lang.priority === 'high' ? '높음' : '보통'}
                          </span>
                        </div>
                        <button 
                          className="request-translation-btn"
                          onClick={() => requestTranslation(selectedProject.submissionId, lang.code)}
                        >
                          번역 요청
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="translation-requests">
                  <h4>번역 요청 현황</h4>
                  <div className="requests-list">
                    {translationRequests
                      .filter(req => req.submissionId === selectedProject.submissionId)
                      .map(request => (
                        <div key={`${request.submissionId}-${request.languageCode}`} className="request-item">
                          <div className="request-header">
                            <span className="language">{request.languageName} {request.flag}</span>
                            <span className={`request-status ${request.status.toLowerCase()}`}>
                              {getRequestStatusText(request.status)}
                            </span>
                          </div>
                          <div className="request-details">
                            <p><strong>번역가:</strong> {request.translator || '미배정'}</p>
                            <p><strong>요청일:</strong> {request.requestDate}</p>
                            {request.completionDate && (
                              <p><strong>완료일:</strong> {request.completionDate}</p>
                            )}
                          </div>
                          <div className="request-actions">
                            {request.status === 'PENDING' && (
                              <button 
                                className="cancel-btn"
                                onClick={() => cancelTranslationRequest(request.submissionId, request.languageCode)}
                              >
                                요청 취소
                              </button>
                            )}
                            {request.status === 'COMPLETED' && (
                              <button 
                                className="review-btn"
                                onClick={() => reviewTranslation(request.submissionId, request.languageCode)}
                              >
                                번역 검토
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="welcome-screen">
                <div className="welcome-icon">🌐</div>
                <h2>다국어 번역 관리</h2>
                <p>번역할 게임을 선택하여 다국어 번역을 요청하고 관리하세요.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Translation;
