// Publishing.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Publishing.css'; 
import SubmissionDetail from './SubmissionDetail';
import WelcomeScreen from './WelcomeScreen';

function Publishing() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  // 더미 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    // 실제 API 호출 대신 더미 데이터 사용
    const dummySubmissions = [
      {
        submissionId: 1,
        contentId: 5,
        projectId: 1,
        userId: 123,
        submitterId: 6,
        submissionMessage: "이 카드 문구는 전략적 선택지를 강조하려고 기획했습니다. 피드백 부탁드립니다.",
        submittedAt: "2024-01-15",
        status: "PENDING",
        gameTitle: "할리갈리2",
        gameDetails: {
          theme: "카드 게임",
          playerCount: "2-6명",
          playTime: "15분",
          difficulty: "쉬움",
          components: ["카드 56장", "종 1개"],
          rules: "같은 과일이 정확히 5개 나오면 종을 치는 게임",
          goal: "빠른 반응속도로 승리하기"
        }
      },
      {
        submissionId: 2,
        contentId: 6,
        projectId: 2,
        userId: 124,
        submitterId: 7,
        submissionMessage: "게임 밸런스 검토 부탁드립니다.",
        submittedAt: "2024-01-16",
        status: "PENDING",
        gameTitle: "할리갈리22",
        gameDetails: {
          theme: "전략 게임",
          playerCount: "3-4명",
          playTime: "45분",
          difficulty: "보통",
          components: ["카드 84장", "토큰 20개"],
          rules: "자원을 수집하여 건물을 짓는 게임",
          goal: "가장 많은 점수 획득하기"
        }
      },
      {
        submissionId: 3,
        contentId: 7,
        projectId: 3,
        userId: 125,
        submitterId: 8,
        submissionMessage: "",
        submittedAt: "2024-01-17",
        status: "PENDING",
        gameTitle: "한라산유",
        gameDetails: {
          theme: "모험 게임",
          playerCount: "2-4명",
          playTime: "60분",
          difficulty: "어려움",
          components: ["보드 1개", "말 4개", "주사위 2개"],
          rules: "한라산을 등반하는 모험 게임",
          goal: "먼저 정상에 도달하기"
        }
      }
    ];
    
    setTimeout(() => {
      setSubmissions(dummySubmissions);
      setLoading(false);
    }, 500);
  }, []);

  const handleSubmissionClick = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleApproval = (submissionId, action) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.submissionId === submissionId 
          ? { ...sub, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
          : sub
      )
    );
  };

  const handleAddMessage = (submissionId, newMessage) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.submissionId === submissionId 
          ? { ...sub, submissionMessage: newMessage }
          : sub
      )
    );
    
    if (selectedSubmission && selectedSubmission.submissionId === submissionId) {
      setSelectedSubmission(prev => ({ ...prev, submissionMessage: newMessage }));
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="publishing-workspace">
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <div className="logo">BOARD.CO</div>
        </div>
        <ul className="workspace-nav-list">
          <li className="nav-item nav-header">기획안 제출 목록</li>
          <li className="nav-item" onClick={() => navigate('/developer-assignment')}>개발자 배정</li>
          <li className="nav-item" onClick={() => navigate('/translation')}>번역</li>
          <li className="nav-item" onClick={() => navigate('/translation-review')}>번역 검토</li>
          <li className="nav-item" onClick={() => navigate('/pricing-evaluation')}>가격 평가</li>
          <li className="nav-item" onClick={() => navigate('/final-approval')}>최종 승인</li>
        </ul>
      </aside>

      <main className="workspace-main-content">
        {!selectedSubmission ? (
          <div className="submissions-main-list">
            <h2>기획안 제출 목록</h2>
            <div className="submissions-grid">
              {submissions.map((submission, index) => (
                <div 
                  key={submission.submissionId} 
                  className="submission-card"
                  onClick={() => handleSubmissionClick(submission)}
                >
                  <div className="submission-card-header">
                    <h3>{submission.gameTitle}</h3>
                    <span className={`status-badge ${submission.status.toLowerCase()}`}>
                      {submission.status === 'PENDING' ? '대기' : submission.status === 'APPROVED' ? '승인' : '반려'}
                    </span>
                  </div>
                  <div className="submission-card-body">
                    <p><strong>테마:</strong> {submission.gameDetails.theme}</p>
                    <p><strong>플레이어:</strong> {submission.gameDetails.playerCount}</p>
                    <p><strong>플레이 시간:</strong> {submission.gameDetails.playTime}</p>
                    <p><strong>난이도:</strong> {submission.gameDetails.difficulty}</p>
                  </div>
                  <div className="submission-card-footer">
                    <span className="submission-date">제출일: {submission.submittedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="welcome-screen">
            <div className="welcome-icon">📋</div>
            <h2>게임 상세 내용</h2>
            <p>팝업에서 {selectedSubmission.gameTitle}의 상세 내용을 확인하세요.</p>
          </div>
        )}
      </main>

      {/* 팝업 모달 - 게임 클릭 시 표시 */}
      {selectedSubmission && (
        <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSubmission.gameTitle} - 상세 내용</h2>
              <button className="close-btn" onClick={() => setSelectedSubmission(null)}>×</button>
            </div>
            <div className="modal-body">
              <SubmissionDetail 
                submission={selectedSubmission}
                onAddMessage={handleAddMessage}
              />
              <div className="modal-actions">
                {selectedSubmission.status === 'PENDING' && (
                  <>
                    <button 
                      className="modal-btn approved"
                      onClick={() => {
                        handleApproval(selectedSubmission.submissionId, 'approve');
                        setSelectedSubmission(null);
                      }}
                    >
                      승인
                    </button>
                    <button 
                      className="modal-btn rejected"
                      onClick={() => {
                        handleApproval(selectedSubmission.submissionId, 'reject');
                        setSelectedSubmission(null);
                      }}
                    >
                      반려
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Publishing;
