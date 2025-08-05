// TranslationReview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TranslationReview.css';

function TranslationReview() {
  const navigate = useNavigate();
  const [translationRequests, setTranslationRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewComments, setReviewComments] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dummyRequests = [
      {
        id: 1,
        gameTitle: "할리갈리2",
        targetLanguage: { code: 'en', name: '영어', flag: '🇺🇸' },
        status: 'TRANSLATION_COMPLETED',
        translator: { name: '번역가A', rating: 4.8 },
        originalText: {
          rules: "같은 과일이 정확히 5개 나오면 종을 치는 게임",
          goal: "빠른 반응속도로 승리하기"
        },
        translatedText: {
          rules: "Ring the bell when exactly 5 identical fruits appear",
          goal: "Win with quick reflexes"
        },
        submittedAt: "2024-01-25"
      },
      {
        id: 2,
        gameTitle: "할리갈리22",
        targetLanguage: { code: 'ja', name: '일본어', flag: '🇯🇵' },
        status: 'TRANSLATION_COMPLETED',
        translator: { name: '번역가B', rating: 4.9 },
        originalText: {
          rules: "자원을 수집하여 건물을 짓는 게임",
          goal: "가장 많은 점수 획득하기"
        },
        translatedText: {
          rules: "リソースを集めて建物を建てるゲーム",
          goal: "最も多くのポイントを獲得する"
        },
        submittedAt: "2024-01-24"
      }
    ];

    setTimeout(() => {
      setTranslationRequests(dummyRequests);
      setLoading(false);
    }, 500);
  }, []);

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setReviewComments('');
  };

  const handleApproveTranslation = () => {
    if (!selectedRequest) return;

    setTranslationRequests(prev =>
      prev.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: 'REVIEW_APPROVED', reviewComments }
          : req
      )
    );

    alert(`${selectedRequest.gameTitle}의 ${selectedRequest.targetLanguage.name} 번역이 승인되었습니다.`);
    setSelectedRequest(null);
    setReviewComments('');
  };

  const handleRejectTranslation = () => {
    if (!selectedRequest) return;
    if (!reviewComments.trim()) {
      alert('반려 사유를 입력해주세요.');
      return;
    }

    setTranslationRequests(prev =>
      prev.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: 'REVIEW_REJECTED', reviewComments }
          : req
      )
    );

    alert(`${selectedRequest.gameTitle}의 ${selectedRequest.targetLanguage.name} 번역이 반려되었습니다.`);
    setSelectedRequest(null);
    setReviewComments('');
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="review-workspace">
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <div className="logo">BOARD.CO</div>
        </div>
        <ul className="workspace-nav-list">
          <li className="nav-item" onClick={() => navigate('/publishing')}>기획안 제출 목록</li>
          <li className="nav-item" onClick={() => navigate('/developer-assignment')}>개발자 배정</li>
          <li className="nav-item" onClick={() => navigate('/translation')}>번역</li>
          <li className="nav-item nav-header">번역 검토</li>
          <li className="nav-item" onClick={() => navigate('/pricing-evaluation')}>가격 평가</li>
          <li className="nav-item" onClick={() => navigate('/final-approval')}>최종 승인</li>
        </ul>
      </aside>

      <main className="workspace-main-content">
        <div className="creator-container">
          <div className="form-column">
            <div className="form-section">
              <h2>번역 검토 대기 목록</h2>
              <div className="game-cards-grid">
                {translationRequests.map((request) => (
                  <div 
                    key={request.id}
                    className={`game-card ${selectedRequest?.id === request.id ? 'selected' : ''}`}
                    onClick={() => handleRequestClick(request)}
                  >
                    <div className="game-card-header">
                      <h3 className="game-title">{request.gameTitle}</h3>
                      <span className={`status-badge ${request.status.toLowerCase().replace('_', '-')}`}>
                        {request.status === 'TRANSLATION_COMPLETED' ? '검토대기' :
                         request.status === 'REVIEW_APPROVED' ? '승인' : '반려'}
                      </span>
                    </div>
                    <div className="game-card-content">
                      <p><strong>대상 언어:</strong> {request.targetLanguage.flag} {request.targetLanguage.name}</p>
                      <p><strong>번역가:</strong> {request.translator.name}</p>
                      <p><strong>평점:</strong> ⭐{request.translator.rating}</p>
                      <p><strong>제출일:</strong> {request.submittedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="result-column">
            {!selectedRequest ? (
              <div className="welcome-screen">
                <div className="welcome-icon">📝</div>
                <h2>번역 검토</h2>
                <p>왼쪽 목록에서 번역을 선택하여 검토하세요.</p>
              </div>
            ) : (
              <div className="review-content">
                <div className="review-header">
                  <h2>{selectedRequest.gameTitle}</h2>
                  <div className="translation-info">
                    <p><strong>언어:</strong> {selectedRequest.targetLanguage.flag} {selectedRequest.targetLanguage.name}</p>
                    <p><strong>번역가:</strong> {selectedRequest.translator.name} ⭐{selectedRequest.translator.rating}</p>
                    <p><strong>제출일:</strong> {selectedRequest.submittedAt}</p>
                  </div>
                </div>

                <div className="translation-comparison">
                  <div className="comparison-section">
                    <h3>게임 규칙</h3>
                    <div className="text-comparison">
                      <div className="original-text">
                        <label>원문 (한국어)</label>
                        <div className="text-content">{selectedRequest.originalText.rules}</div>
                      </div>
                      <div className="translated-text">
                        <label>번역문 ({selectedRequest.targetLanguage.name})</label>
                        <div className="text-content">{selectedRequest.translatedText.rules}</div>
                      </div>
                    </div>
                  </div>

                  <div className="comparison-section">
                    <h3>게임 목표</h3>
                    <div className="text-comparison">
                      <div className="original-text">
                        <label>원문 (한국어)</label>
                        <div className="text-content">{selectedRequest.originalText.goal}</div>
                      </div>
                      <div className="translated-text">
                        <label>번역문 ({selectedRequest.targetLanguage.name})</label>
                        <div className="text-content">{selectedRequest.translatedText.goal}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="review-actions">
                  <div className="comments-section">
                    <label>검토 의견</label>
                    <textarea
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      placeholder="번역에 대한 의견이나 수정 요청 사항을 입력하세요..."
                      rows={4}
                    />
                  </div>

                  <div className="action-buttons">
                    <button 
                      className="approve-btn"
                      onClick={handleApproveTranslation}
                    >
                      번역 승인
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={handleRejectTranslation}
                    >
                      번역 반려
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default TranslationReview;
