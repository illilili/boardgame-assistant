import React, { useState, useEffect, useContext } from 'react';
import './GameConceptCreator.css'; 
import { generateConcept, regenerateConcept, getAllConcepts } from '../api/auth'; 
import { ProjectContext } from '../contexts/ProjectContext';

const GameConceptCreator = () => {
    const { projectId } = useContext(ProjectContext);

    const [activeTab, setActiveTab] = useState('generate');
    const [theme, setTheme] = useState('');
    const [playerCount, setPlayerCount] = useState('');
    const [averageWeight, setAverageWeight] = useState(2.5);
    const [regenerateConceptList, setRegenerateConceptList] = useState([]);
    const [selectedConceptInfo, setSelectedConceptInfo] = useState('');
    const [feedback, setFeedback] = useState('');
    const [concept, setConcept] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInitialState, setIsInitialState] = useState(true);
    
    useEffect(() => {
        if (activeTab === 'regenerate' && projectId) {
            const fetchListForDropdown = async () => {
                try {
                    const data = await getAllConcepts();
                    const filteredData = data.filter(c => c.projectId === parseInt(projectId));
                    filteredData.sort((a, b) => b.conceptId - a.conceptId);
                    setRegenerateConceptList(filteredData);
                    if (filteredData.length > 0) {
                        const firstConcept = filteredData[0];
                        setSelectedConceptInfo(`${firstConcept.conceptId},${firstConcept.planId}`);
                        setConcept(firstConcept);
                        setIsInitialState(false);
                    } else {
                        setSelectedConceptInfo('');
                        setConcept(null);
                        setIsInitialState(true);
                    }
                } catch (err) {
                    setError('컨셉 목록을 불러올 수 없습니다.');
                }
            };
            fetchListForDropdown();
        } else {
             setConcept(null);
             setIsInitialState(true);
        }
    }, [activeTab, projectId]);

    const fetchConcept = async (apiFunc, body) => {
        setLoading(true);
        setError(null);
        setConcept(null);
        setIsInitialState(false);

        try {
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
            projectId: parseInt(projectId),
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
            originalConcept: {
                ...originalConceptData,
                projectId: parseInt(projectId)
            },
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
        const conceptToPreview = regenerateConceptList.find(c => c.conceptId === selectedConceptId);

        if (conceptToPreview) {
            setConcept(conceptToPreview); 
            setIsInitialState(false);
            setError(null);
        }
    };
    
    return (
        <div className="gcc__container">
            <div className="gcc__form-column">
                <div className="gcc__tab-navigation">
                    <button className={`gcc__tab-button ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => setActiveTab('generate')}>
                        새로 만들기
                    </button>
                    <button className={`gcc__tab-button ${activeTab === 'regenerate' ? 'active' : ''}`} onClick={() => setActiveTab('regenerate')}>
                        다시 만들기
                    </button>
                </div>

                {activeTab === 'generate' && (
                    <div className="gcc__form-content">
                        <h2 className="gcc__form-title">새로운 게임 컨셉 만들기</h2>
                        <p className="gcc__form-description">게임의 기본 요소를 입력하여 AI에게 새로운 아이디어를 얻어보세요.</p>
                        <form onSubmit={handleGenerateSubmit}>
                            <div className="gcc__form-group">
                                <label htmlFor="theme">게임 테마</label>
                                <input id="theme" type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="예: 우주 탐험, 사이버펑크" required />
                            </div>
                            <div className="gcc__form-group">
                                <label htmlFor="playerCount">플레이어 수</label>
                                <input id="playerCount" type="text" value={playerCount} onChange={(e) => setPlayerCount(e.target.value)} placeholder="예: 2-4명" required />
                            </div>
                            <div className="gcc__form-group">
                                <label htmlFor="averageWeight">난이도: {averageWeight}</label>
                                <input id="averageWeight" type="range" value={averageWeight} onChange={(e) => setAverageWeight(e.target.value)} min="1.0" max="5.0" step="0.1" required />
                            </div>
                            <button type="submit" className="gcc__submit-button" disabled={loading || !projectId}>
                                {loading ? '생성 중...' : '컨셉 생성하기'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'regenerate' && (
                    <div className="gcc__form-content">
                        <h2 className="gcc__form-title">기존 컨셉 발전시키기</h2>
                        <p className="gcc__form-description">피드백을 제공하여 기존 컨셉을 AI와 함께 개선해보세요.</p>
                        <form onSubmit={handleRegenerateSubmit}>
                            <div className="gcc__form-group">
                                <label htmlFor="regenerateConcept">재생성할 컨셉 선택</label>
                                <select id="regenerateConcept" value={selectedConceptInfo} onChange={handleConceptSelectionChange} required>
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
                            <div className="gcc__form-group">
                                <label htmlFor="feedback">피드백</label>
                                <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="예: 좀 더 캐주얼한 분위기, 전략적 깊이 추가" rows="5" required></textarea>
                            </div>
                            <button type="submit" className="gcc__submit-button" disabled={loading}>
                                {loading ? '재생성 중...' : '컨셉 재생성하기'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div className="gcc__result-column">
                {error && <div className="gcc__error-message">{error}</div>}
                {loading && (
                    <div className="gcc__loading-state">
                        <div className="gcc__spinner"></div>
                        <p>AI가 멋진 아이디어를 구상하고 있어요...</p>
                    </div>
                )}
                {!loading && !error && isInitialState && (
                    <div className="gcc__initial-state">
                        <h3>AI 컨셉 결과</h3>
                        <p>왼쪽 양식을 작성하거나, '다시 만들기'에서 컨셉을 선택하면 상세 내용이 여기에 표시됩니다.</p>
                    </div>
                )}
                {concept && !loading && (
                    <div className="gcc__concept-card">
                        <div className="gcc__card-header">
                            <span className="gcc__card-tag">Plan ID: {concept.planId}</span>
                            <span className="gcc__card-tag">Concept ID: {concept.conceptId}</span>
                        </div>
                        <h3 className="gcc__concept-title">{concept.theme}</h3>
                        <div className="gcc__concept-meta">
                            <span><strong>플레이 인원:</strong> {concept.playerCount}</span>
                            <span><strong>난이도:</strong> {concept.averageWeight.toFixed(1)}</span>
                        </div>
                        <div className="gcc__concept-section"><h4>핵심 아이디어</h4><p>{concept.ideaText}</p></div>
                        <div className="gcc__concept-section"><h4>주요 메커니즘</h4><p>{concept.mechanics}</p></div>
                        <div className="gcc__concept-section"><h4>배경 스토리</h4><p>{concept.storyline}</p></div>
                        <div className="gcc__card-footer">생성 시간: {new Date(concept.createdAt).toLocaleString('ko-KR')}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameConceptCreator;
