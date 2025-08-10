// Publishing.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Publishing.css'; 

import SubmissionDetail from './SubmissionDetail';
import WelcomeScreen from './WelcomeScreen';

import { FaUserCircle } from 'react-icons/fa'; //프로필
import { FiMoreHorizontal } from 'react-icons/fi';
import { getMyPageInfo } from '../api/users'; //마이페이지 api 사용
import { logout } from '../api/auth';

// --- 데이터 및 메인 컴포넌트 --- 수정 필
const workspaceNavItems = [
  { id: 'header', title: '기획안 제출 목록', isHeader: true },
  { id: 'developer', title: '개발자 배정', path: '/developer-assignment' },
  { id: 'translation', title: '번역', path: '/translation' },
  { id: 'translationReview', title: '번역 검토', path: '/translation-review' },
  { id: 'pricing', title: '가격 평가', path: '/pricing-evaluation' },
  { id: 'finalApproval', title: '최종 승인', path: '/final-approval' },
  { id: ''}
];

function Publishing() {
  // const navigate = useNavigate();
  const [activeViewId, setActiveViewId] = useState(null);
  
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userName, setUserName] = useState(''); //사이드바 하단 프로필 이름
  useEffect(() => {
      const fetchUserName = async () => {
        try {
          const data = await getMyPageInfo();
          setUserName(data.userName);
        } catch (err) {
          console.error('유저 이름 조회 실패', err);
        }
      };
  
      fetchUserName();
    }, []);

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

  //로그아웃 핸들러
      const handleLogout = async (e) => {
        e.preventDefault();
        try {
          const result = await logout();
          alert(result.message); // "로그아웃 되었습니다."
          // 토큰 및 권한 정보 제거 - 추후 보고 삭제하거나 조정필요할듯
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('role');
          // 리디렉션 - 메인으로 이동
          window.location.href = '/';
        } catch (error) {
          console.error('로그아웃 실패:', error);
          alert('로그아웃 중 오류가 발생했습니다.');
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
        {workspaceNavItems.map((item) => (
          <li
            key={item.id}
            className={`nav-item ${activeViewId === item.id ? 'active' : ''}`}
            onClick={() => setActiveViewId(item.id)}
          >
            {item.title}
          </li>
        ))}
      </ul>

      {/* 하단 유저 메뉴 */}
      <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-gray-300">
        {/* 프로필 + 환영문구 묶음 */}
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center gap-3">
            <FaUserCircle size={40} className="text-gray-500" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{userName} 님</span>
              <span className="text-xs text-gray-500">환영합니다!</span>
            </div>
          </div>

          <Link to="/mypage" className="text-gray-600 hover:text-teal-500">
            <FiMoreHorizontal size={18} />
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded hover:bg-red-100 text-red-500 font-semibold"
        >
          로그아웃
        </button>
      </div>
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
