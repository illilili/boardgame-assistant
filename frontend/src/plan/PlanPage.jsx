import React, { useState, useEffect } from 'react';
import './PlanPage.css'; // CSS 파일을 임포트합니다.
// Markdown을 HTML로 렌더링하기 위한 라이브러리입니다.
// 실제 프로젝트에서는 터미널에 `npm install react-markdown`을 실행하여 설치해야 합니다.
// import ReactMarkdown from 'react-markdown'; 

const PlanPage = () => {
    const [conceptList, setConceptList] = useState([]);
    const [conceptId, setConceptId] = useState('');
    const [document, setDocument] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 컴포넌트가 처음 렌더링될 때, 서버에서 컨셉 목록을 가져옵니다.
    useEffect(() => {
        const fetchConcepts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Spring Boot에 추가된 컨셉 목록 조회 API를 호출합니다.
                const response = await fetch('http://localhost:8080/api/plans/concepts-for-summary');
                if (!response.ok) {
                    throw new Error('컨셉 목록을 불러오는 데 실패했습니다.');
                }
                const data = await response.json();
                setConceptList(data);
                // 목록을 성공적으로 불러오면, 첫 번째 항목을 기본 선택값으로 설정합니다.
                if (data.length > 0) {
                    setConceptId(data[0].conceptId);
                }
            } catch (err) {
                setError('컨셉 목록을 가져올 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchConcepts();
    }, []); // 빈 배열을 전달하여 이펙트는 최초 1회만 실행됩니다.

    // '기획서 생성하기' 버튼 클릭 시 실행되는 함수
    const handleGenerateSummary = async (e) => {
        e.preventDefault();
        if (!conceptId) {
            setError('먼저 기획 컨셉을 선택해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setDocument('');

        try {
            const response = await fetch('http://localhost:8080/api/plans/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conceptId: parseInt(conceptId) }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '기획서 생성 중 서버에서 오류가 발생했습니다.');
            }
            const data = await response.text();
            setDocument(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="summary-page-container">
            <header className="summary-header">
                <h1>AI 게임 기획서 생성</h1>
                <p>컨셉을 선택하고 버튼을 누르면, 모든 기획 데이터를 종합하여 AI가 완성된 기획서를 작성합니다.</p>
            </header>

            <div className="summary-controls card">
                <form onSubmit={handleGenerateSummary}>
                    <div className="form-group">
                        <label htmlFor="conceptId">컨셉 선택</label>
                        <select
                            id="conceptId"
                            value={conceptId}
                            onChange={(e) => setConceptId(e.target.value)}
                            disabled={isLoading || conceptList.length === 0}
                            required
                        >
                            <option value="" disabled>-- 기획 컨셉을 선택하세요 --</option>
                            {conceptList.map(concept => (
                                <option key={concept.conceptId} value={concept.conceptId}>
                                    ID: {concept.conceptId} - {concept.theme}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="primary-button" disabled={isLoading}>
                        {isLoading ? 'AI가 기획서 작성 중...' : '기획서 생성하기'}
                    </button>
                </form>
            </div>

            <div className="summary-document-view card">
                <h2>생성된 기획서</h2>
                {isLoading && <div className="spinner"></div>}
                {error && <div className="error-message">{error}</div>}
                {document ? (
                    // ReactMarkdown을 사용하면 Markdown 문법이 예쁘게 렌더링됩니다.
                    // <ReactMarkdown>{document}</ReactMarkdown>
                    <pre className="document-content">{document}</pre>
                ) : (
                    !isLoading && <p>기획서를 생성하면 결과가 여기에 표시됩니다.</p>
                )}
            </div>
        </div>
    );
};

export default PlanPage;