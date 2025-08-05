// 파일: Components.js
import React, { useState, useEffect } from 'react';
import './Components.css';

const Components = () => {
    const [conceptList, setConceptList] = useState([]);
    const [selectedConceptId, setSelectedConceptId] = useState('');
    const [componentsData, setComponentsData] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConcepts = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/plans/concepts');
                if (!response.ok) throw new Error('컨셉 목록을 불러오는 데 실패했습니다.');
                const data = await response.json();
                setConceptList(data.sort((a, b) => b.conceptId - a.conceptId));
            } catch (err) {
                setError(err.message);
            }
        };
        fetchConcepts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedConceptId) {
            setError('먼저 기획안을 선택해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setComponentsData(null);

        try {
            const response = await fetch('http://localhost:8080/api/plans/generate-components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conceptId: parseInt(selectedConceptId) }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '구성요소 생성에 실패했습니다.');
            }
            const data = await response.json();
            setComponentsData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = async (e) => {
        e.preventDefault();
        if (!selectedConceptId) {
            setError('기획안이 선택되지 않았습니다.');
            return;
        }
        if (!feedback.trim()) {
            setError('피드백을 입력해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8080/api/plans/regenerate-components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conceptId: parseInt(selectedConceptId),
                    feedback: feedback,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '구성요소 재생성에 실패했습니다.');
            }

            const data = await response.json();
            setComponentsData(data);
            setFeedback('');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="components-container">
            <div className="components-form-section">
                <h2>게임 구성요소 설계</h2>
                <p>구성요소를 설계할 기획안을 선택하고 AI에게 생성을 요청하세요.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="concept-select">기획안 선택 (Concept ID 기준)</label>
                        <select
                            id="concept-select"
                            value={selectedConceptId}
                            onChange={(e) => setSelectedConceptId(e.target.value)}
                            required
                        >
                            <option value="" disabled>-- 기획안(Concept) 선택 --</option>
                            {conceptList.map(c => (
                                <option key={c.conceptId} value={c.conceptId}>
                                    ID: {c.conceptId} - {c.theme}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" disabled={isLoading} className="submit-button">
                        {isLoading ? 'AI 설계 중...' : '구성요소 생성하기'}
                    </button>
                </form>
            </div>

            <div className="components-result-section">
                {isLoading && <div className="spinner"></div>}
                {error && <div className="error-message">{error}</div>}
                {componentsData && (
                    <div className="components-card">
                        <h3>AI가 설계한 게임 구성요소</h3>
                        <div className="components-list">
                            {Array.isArray(componentsData.component) && componentsData.component.map((item) => (
                                <div key={item.componentId} className="component-item">
                                    <div className="item-header">
                                        <span className="item-type-tag">{item.type}</span>
                                        <strong className="item-name">{item.title}</strong>
                                        {item.quantity && <span className="item-quantity">({item.quantity})</span>}
                                    </div>
                                    <p className="item-detail"><strong>역할 및 효과:</strong> {item.roleAndEffect}</p>
                                    <p className="item-detail"><strong>아트 컨셉:</strong> {item.artConcept}</p>
                                    <p className="item-detail"><strong>상호작용:</strong> {item.interconnection}</p>

                                    <div className="subtask-section">
                                        <strong>세부 제작 작업:</strong>
                                        <ul className="subtask-list">
                                            {Array.isArray(item.subTasks) && item.subTasks.map(task => (
                                                <li key={task.contentId} className={`status-${task.status.toLowerCase()}`}>
                                                    {task.type} ({task.status})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="regeneration-form">
                            <h4>피드백으로 개선하기</h4>
                            <p>AI가 생성한 구성요소가 마음에 들지 않으신가요? 아래에 피드백을 남겨 AI가 더 나은 결과물을 만들도록 해보세요.</p>
                            <form onSubmit={handleRegenerate}>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="예시) 카드의 종류가 너무 적어요. 전략적인 아이템 카드를 추가해주세요."
                                    rows="4"
                                    required
                                ></textarea>
                                <button type="submit" disabled={isLoading} className="regenerate-button">
                                    {isLoading ? 'AI 재설계 중...' : '피드백으로 재생성하기'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {!isLoading && !componentsData && !error && (
                    <div className="initial-state">
                        <p>사용자께서는 먼저 원하는 기획안을 선택해 주시기 바랍니다.
                            기획안을 선택하신 후, '구성요소 생성하기' 버튼을 눌러주세요.
                            버튼을 클릭하면 인공지능이 선택된 기획안의 내용을 분석합니다.
                            분석을 바탕으로 게임에 필요한 주요 구성요소들이 자동으로 설계됩니다.
                            생성된 구성요소들은 아래 결과 창에 실시간으로 표시됩니다.
                            이를 통해 사용자께서는 게임 제작에 필요한 핵심 요소들을 쉽게 확인하실 수 있습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Components;