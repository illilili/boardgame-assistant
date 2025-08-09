import React, { useState, useEffect } from 'react';
import './GameConceptCreator.css'; 
// 🚨 새로 만든 API 함수들을 한 번에 임포트
import { getMyProjects, generateConcept, regenerateConcept, getAllConcepts } from '../api/auth'; 

const GameConceptCreator = () => {
  const [activeTab, setActiveTab] = useState('generate');

  // 새로운 컨셉 생성 상태
  const [theme, setTheme] = useState('');
  const [playerCount, setPlayerCount] = useState('');
  const [averageWeight, setAverageWeight] = useState(2.5);
  const [projectList, setProjectList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // 컨셉 재생성 상태
  const [regenerateConceptList, setRegenerateConceptList] = useState([]);
  const [selectedConceptInfo, setSelectedConceptInfo] = useState('');
  const [feedback, setFeedback] = useState('');

  // 공통 결과 및 로딩/에러 상태
  const [concept, setConcept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialState, setIsInitialState] = useState(true);
  
  useEffect(() => {
    const fetchProjects = async () => {
        try {
            const data = await getMyProjects(); // 🚨 getMyProjects 함수 사용
            setProjectList(data);
            if (data.length > 0) {
                setSelectedProjectId(data[0].projectId);
            }
        } catch (err) {
            console.error(err);
            setError('프로젝트 목록을 불러올 수 없습니다. 로그인이 유효한지 확인해주세요.');
        }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (activeTab === 'regenerate') {
      const fetchListForDropdown = async () => {
        try {
          const data = await getAllConcepts(); // 🚨 getAllConcepts 함수 사용
          data.sort((a, b) => b.conceptId - a.conceptId);
          setRegenerateConceptList(data);
        } catch (err) {
          setError('컨셉 목록을 불러올 수 없습니다.');
        }
      };
      fetchListForDropdown();
    }
  }, [activeTab]);


  const fetchConcept = async (apiFunc, body) => {
    setLoading(true);
    setError(null);
    setConcept(null);
    setIsInitialState(false);

    try {
      // 🚨 공통화된 API 함수를 호출
      const data = await apiFunc(body);
      setConcept(data);
    } catch (err) {
      console.error("API 호출 오류:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    fetchConcept(generateConcept, {
      projectId: selectedProjectId,
      theme,
      playerCount,
      averageWeight: parseFloat(averageWeight),
    });
  };

  const handleRegenerateSubmit = (e) => {
    e.preventDefault();
    if (!selectedConceptInfo || !feedback) {
      setError('재생성할 컨셉과 피드백을 모두 입력해주세요.');
      return;
    }
    
    const selectedConceptId = parseInt(selectedConceptInfo.split(',')[0], 10);
    const originalConceptData = regenerateConceptList.find(c => c.conceptId === selectedConceptId);

    if (!originalConceptData) {
        setError('선택된 컨셉 정보를 찾을 수 없습니다.');
        return;
    }

    const body = {
      originalConcept: originalConceptData,
      feedback: feedback
    };

    fetchConcept(regenerateConcept, body);
  };

  const handleConceptSelectionChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedConceptInfo(selectedValue);

    if (!selectedValue) {
      setConcept(null);
      setIsInitialState(true);
      return;
    }

    const selectedConceptId = parseInt(selectedValue.split(',')[0], 10);
    const conceptToPreview = regenerateConceptList.find(
      c => c.conceptId === selectedConceptId
    );

    if (conceptToPreview) {
      setConcept(conceptToPreview); 
      setIsInitialState(false);      
      setError(null);             
    }
  };


  return (
    <div className="creator-container">
      <div className="form-column">
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            새로 만들기
          </button>
          <button
            className={`tab-button ${activeTab === 'regenerate' ? 'active' : ''}`}
            onClick={() => setActiveTab('regenerate')}
          >
            다시 만들기
          </button>
        </div>

        {activeTab === 'generate' && (
          <div className="form-content">
            <h2 className="form-title">새로운 게임 컨셉 만들기</h2>
              <p className="form-description">게임의 기본 요소를 입력하여 AI에게 새로운 아이디어를 얻어보세요.</p>
              <form onSubmit={handleGenerateSubmit}>
                <div className="form-group">
                    <label htmlFor="projectId">프로젝트 선택</label>
                    <select
                        id="projectId"
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        required
                    >
                        {projectList.length > 0 ? (
                            projectList.map((project) => (
                                <option key={project.projectId} value={project.projectId}>
                                    {project.projectName}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>프로젝트를 먼저 생성해주세요.</option>
                        )}
                    </select>
                </div>
                <div className="form-group">
                  <label htmlFor="theme">게임 테마</label>
                  <input id="theme" type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="예: 우주 탐험, 사이버펑크" required />
                </div>
                <div className="form-group">
                  <label htmlFor="playerCount">플레이어 수</label>
                  <input id="playerCount" type="text" value={playerCount} onChange={(e) => setPlayerCount(e.target.value)} placeholder="예: 2-4명" required />
                </div>
                <div className="form-group">
                  <label htmlFor="averageWeight">난이도: {averageWeight}</label>
                  <input id="averageWeight" type="range" value={averageWeight} onChange={(e) => setAverageWeight(e.target.value)} min="1.0" max="5.0" step="0.1" required />
                </div>
                <button type="submit" className="submit-button" disabled={loading || !selectedProjectId}>
                  {loading ? '생성 중...' : '컨셉 생성하기'}
                </button>
              </form>
          </div>
        )}

        {activeTab === 'regenerate' && (
          <div className="form-content">
            <h2 className="form-title">기존 컨셉 발전시키기</h2>
            <p className="form-description">피드백을 제공하여 기존 컨셉을 AI와 함께 개선해보세요.</p>
            <form onSubmit={handleRegenerateSubmit}>
              <div className="form-group">
                <label htmlFor="regenerateConcept">재생성할 컨셉 선택</label>
                <select
                  id="regenerateConcept"
                  value={selectedConceptInfo}
                  onChange={handleConceptSelectionChange}
                  required
                >
                  <option value="" disabled>-- 컨셉을 선택하세요 --</option>
                  {regenerateConceptList.length > 0 ? (
                    regenerateConceptList.map((item) => (
                      <option key={item.conceptId} value={`${item.conceptId},${item.planId}`}>
                        ID: {item.conceptId} - {item.theme}
                      </option>
                    ))
                  ) : (
                    <option disabled>불러올 컨셉이 없습니다.</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="feedback">피드백</label>
                <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="예: 좀 더 캐주얼한 분위기, 전략적 깊이 추가" rows="5" required></textarea>
              </div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? '재생성 중...' : '컨셉 재생성하기'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="result-column">
        {error && <div className="error-message">{error}</div>}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>AI가 멋진 아이디어를 구상하고 있어요...</p>
          </div>
        )}

        {!loading && !error && isInitialState && !concept && (
          <div className="initial-state">
            <h3>AI 컨셉 결과</h3>
            <p>왼쪽 양식을 작성하거나, '다시 만들기'에서 컨셉을 선택하면 상세 내용이 여기에 표시됩니다.</p>
          </div>
        )}

        {concept && (
          <div className="concept-card">
            <div className="card-header">
              <span className="card-tag">Plan ID: {concept.planId}</span>
              <span className="card-tag">Concept ID: {concept.conceptId}</span>
            </div>
            <h3 className="concept-title">{concept.theme}</h3>
            <div className="concept-meta">
              <span><strong>플레이 인원:</strong> {concept.playerCount}</span>
              <span><strong>난이도:</strong> {concept.averageWeight.toFixed(1)}</span>
            </div>
            <div className="concept-section">
              <h4>핵심 아이디어</h4>
              <p>{concept.ideaText}</p>
            </div>
            <div className="concept-section">
              <h4>주요 메커니즘</h4>
            <p>{concept.mechanics}</p>
            </div>
            <div className="concept-section">
              <h4>배경 스토리</h4>
              <p>{concept.storyline}</p>
            </div>
            <div className="card-footer">
              생성 시간: {new Date(concept.createdAt).toLocaleString('ko-KR')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameConceptCreator;