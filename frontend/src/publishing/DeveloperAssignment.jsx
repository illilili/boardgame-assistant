// DeveloperAssignment.jsx 개발자 배정
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DeveloperAssignment.css';

function DeveloperAssignment() {
  const navigate = useNavigate();
  const [approvedSubmissions, setApprovedSubmissions] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);

  // 더미 데이터
  useEffect(() => {
    const dummyApprovedSubmissions = [
      {
        submissionId: 1,
        gameTitle: "할리갈리2",
        status: "APPROVED",
        approvedAt: "2024-01-15",
        assignedDeveloper: null,
        gameDetails: {
          theme: "카드 게임",
          playerCount: "2-6명",
          playTime: "15분",
          difficulty: "쉬움"
        }
      },
      {
        submissionId: 2,
        gameTitle: "할리갈리2",
        status: "APPROVED", 
        approvedAt: "2024-01-15",
        assignedDeveloper: null,
        gameDetails: {
          theme: "카드 게임",
          playerCount: "2-6명",
          playTime: "19분",
          difficulty: "쉬움"
        }
      },
      {
        submissionId: 3,
        gameTitle: "할리갈리22",
        status: "APPROVED",
        approvedAt: "2024-01-16",
        assignedDeveloper: null,
        gameDetails: {
          theme: "전략 게임",
          playerCount: "3-4명",
          playTime: "45분",
          difficulty: "보통"
        }
      },
      {
        submissionId: 4,
        gameTitle: "할리갈리22",
        status: "APPROVED",
        approvedAt: "2024-01-16",
        assignedDeveloper: null,
        gameDetails: {
          theme: "전략 게임",
          playerCount: "3-4명",
          playTime: "45분",
          difficulty: "보통"
        }
      },
      {
        submissionId: 5,
        gameTitle: "한라산유",
        status: "APPROVED",
        approvedAt: "2024-01-17",
        assignedDeveloper: null,
        gameDetails: {
          theme: "모험 게임",
          playerCount: "2-4명",
          playTime: "60분",
          difficulty: "어려움"
        }
      },
      {
        submissionId: 6,
        gameTitle: "한라산유",
        status: "APPROVED",
        approvedAt: "2024-01-17",
        assignedDeveloper: null,
        gameDetails: {
          theme: "모험 게임",
          playerCount: "2-4명",
          playTime: "60분",
          difficulty: "어려움"
        }
      }
    ];

    const dummyDevelopers = [
      {
        id: 1,
        name: "김개발",
        specialty: "카드게임",
        experience: "5년",
        currentProjects: 2,
        maxProjects: 5,
        rating: 4.8,
        completedGames: 12
      },
      {
        id: 2,
        name: "박코딩",
        specialty: "보드게임", 
        experience: "7년",
        currentProjects: 1,
        maxProjects: 4,
        rating: 4.9,
        completedGames: 18
      },
      {
        id: 3,
        name: "이프로그램",
        specialty: "전략게임",
        experience: "3년",
        currentProjects: 3,
        maxProjects: 6,
        rating: 4.6,
        completedGames: 8
      },
      {
        id: 4,
        name: "최디벨롭",
        specialty: "퍼즐게임",
        experience: "4년",
        currentProjects: 0,
        maxProjects: 3,
        rating: 4.7,
        completedGames: 10
      }
    ];

    setTimeout(() => {
      setApprovedSubmissions(dummyApprovedSubmissions);
      setDevelopers(dummyDevelopers);
      setLoading(false);
    }, 500);
  }, []);

  const handleSubmissionClick = (submission) => {
    setSelectedSubmission(submission);
    setSelectedDeveloper(submission.assignedDeveloper);
  };

  const handleDeveloperSelect = (developer) => {
    setSelectedDeveloper(developer);
  };

  const handleAssignDeveloper = () => {
    if (!selectedSubmission || !selectedDeveloper) {
      alert('게임과 개발자를 모두 선택해주세요.');
      return;
    }

    // 개발자 배정 처리
    setApprovedSubmissions(prev =>
      prev.map(sub =>
        sub.submissionId === selectedSubmission.submissionId
          ? { ...sub, assignedDeveloper: selectedDeveloper, status: "DEVELOPER_ASSIGNED" }
          : sub
      )
    );

    // 개발자의 현재 프로젝트 수 증가
    setDevelopers(prev =>
      prev.map(dev =>
        dev.id === selectedDeveloper.id
          ? { ...dev, currentProjects: dev.currentProjects + 1 }
          : dev
      )
    );

    alert(`${selectedDeveloper.name} 개발자가 ${selectedSubmission.gameTitle}에 배정되었습니다.`);
    setSelectedSubmission(null);
    setSelectedDeveloper(null);
  };

  const handleUnassignDeveloper = () => {
    if (!selectedSubmission || !selectedSubmission.assignedDeveloper) {
      return;
    }

    const currentDeveloper = selectedSubmission.assignedDeveloper;

    // 개발자 배정 해제
    setApprovedSubmissions(prev =>
      prev.map(sub =>
        sub.submissionId === selectedSubmission.submissionId
          ? { ...sub, assignedDeveloper: null, status: "APPROVED" }
          : sub
      )
    );

    // 개발자의 현재 프로젝트 수 감소
    setDevelopers(prev =>
      prev.map(dev =>
        dev.id === currentDeveloper.id
          ? { ...dev, currentProjects: Math.max(0, dev.currentProjects - 1) }
          : dev
      )
    );

    alert(`${currentDeveloper.name} 개발자 배정이 해제되었습니다.`);
    setSelectedSubmission(null);
    setSelectedDeveloper(null);
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="developer-assignment-workspace">
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <div className="logo">BOARD.CO</div>
        </div>
        <ul className="workspace-nav-list">
          <li className="nav-item" onClick={() => navigate('/publishing')}>기획안 제출 목록</li>
          <li className="nav-item nav-header">개발자 배정</li>
          <li className="nav-item" onClick={() => navigate('/translation')}>번역</li>
          <li className="nav-item" onClick={() => navigate('/translation-review')}>번역 검토</li>
          <li className="nav-item" onClick={() => navigate('/pricing-evaluation')}>가격 평가</li>
          <li className="nav-item" onClick={() => navigate('/final-approval')}>최종 승인</li>
        </ul>
      </aside>

      <main className="workspace-main-content">
        <div className="creator-container">
          <div className="form-column">
            <h4>승인된 게임 목록</h4>
            <div className="game-cards-grid">
              {approvedSubmissions.map((submission) => (
                <div 
                  key={submission.submissionId} 
                  className={`game-card ${selectedSubmission?.submissionId === submission.submissionId ? 'selected' : ''}`}
                  onClick={() => handleSubmissionClick(submission)}
                >
                  <div className="game-card-header">
                    <h3 className="game-title">{submission.gameTitle}</h3>
                    <span className={`status-badge ${submission.assignedDeveloper ? 'assigned' : 'pending'}`}>
                      {submission.assignedDeveloper ? '대기' : '대기'}
                    </span>
                  </div>
                  <div className="game-card-content">
                    <p><strong>테마:</strong> {submission.gameDetails.theme}</p>
                    <p><strong>플레이어:</strong> {submission.gameDetails.playerCount}</p>
                    <p><strong>플레이 시간:</strong> {submission.gameDetails.playTime}</p>
                    <p><strong>난이도:</strong> {submission.gameDetails.difficulty}</p>
                    <p className="approval-date"><strong>제출일:</strong> {submission.approvedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="result-column">
            {!selectedSubmission ? (
          <div className="welcome-screen">
            <div className="welcome-icon">👨‍💻</div>
            <h2>개발자 배정 관리</h2>
            <p>위 목록에서 게임을 선택하여 개발자를 배정하세요.</p>
          </div>
        ) : (
          <div className="assignment-content">
            <div className="game-info-section">
              <h2>선택된 게임: {selectedSubmission.gameTitle}</h2>
              <div className="game-details">
                <p><strong>테마:</strong> {selectedSubmission.gameDetails.theme}</p>
                <p><strong>플레이어:</strong> {selectedSubmission.gameDetails.playerCount}</p>
                <p><strong>플레이 시간:</strong> {selectedSubmission.gameDetails.playTime}</p>
                <p><strong>난이도:</strong> {selectedSubmission.gameDetails.difficulty}</p>
                <p><strong>승인일:</strong> {selectedSubmission.approvedAt}</p>
              </div>

              {selectedSubmission.assignedDeveloper && (
                <div className="current-assignment">
                  <h3>현재 배정된 개발자</h3>
                  <div className="assigned-developer">
                    <p><strong>이름:</strong> {selectedSubmission.assignedDeveloper.name}</p>
                    <p><strong>전문분야:</strong> {selectedSubmission.assignedDeveloper.specialty}</p>
                    <button 
                      className="unassign-btn"
                      onClick={handleUnassignDeveloper}
                    >
                      배정 해제
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="developers-section">
              <h3>개발자 목록</h3>
              <div className="developers-list">
                {developers.map((developer) => (
                  <div 
                    key={developer.id}
                    className={`developer-item ${selectedDeveloper?.id === developer.id ? 'selected' : ''} 
                               ${developer.currentProjects >= developer.maxProjects ? 'unavailable' : ''}`}
                    onClick={() => developer.currentProjects < developer.maxProjects && handleDeveloperSelect(developer)}
                  >
                    <div className="developer-name-rating">
                      <span className="developer-name">{developer.name}</span>
                      <span className="rating">⭐ {developer.rating}</span>
                    </div>
                    <div className="developer-details">
                      <div className="detail-row">
                        <span className="label">전문분야:</span>
                        <span className="value">{developer.specialty}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">경력:</span>
                        <span className="value">{developer.experience}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">완성 게임:</span>
                        <span className="value">{developer.completedGames}개</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">현재 프로젝트:</span>
                        <span className="value">{developer.currentProjects}/{developer.maxProjects}</span>
                      </div>
                    </div>
                    <div className="availability-status">
                      {developer.currentProjects >= developer.maxProjects ? (
                        <span className="unavailable-text">배정 불가</span>
                      ) : (
                        <span className="available-text">배정 가능</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedDeveloper && !selectedSubmission.assignedDeveloper && (
                <div className="assignment-action">
                  <button 
                    className="assign-btn"
                    onClick={handleAssignDeveloper}
                  >
                    {selectedDeveloper.name} 개발자에게 배정하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DeveloperAssignment;
