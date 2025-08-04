import React, { useState, useEffect } from 'react';
// 파일 생성을 위한 라이브러리입니다.
// 터미널에 `npm install docx` 를 실행하여 설치해주세요.
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';

// CSS를 React 컴포넌트 내에 <style> 태그로 포함시켰습니다.
// 이렇게 하면 별도의 CSS 파일 없이 이 파일 하나만으로 스타일이 적용됩니다.
const PlanPageStyles = `
/* --- 전체 레이아웃 (2단 구조로 수정) --- */
.summary-page-container {
  display: flex;
  gap: 24px;
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
  padding: 0;
  flex-grow: 1; /* ★★★ 수정된 부분: height: 100% 대신 flex-grow: 1을 사용합니다 ★★★ */
  min-height: 0; /* flexbox 아이템이 부모를 넘어설 때를 대비한 설정 */
  box-sizing: border-box;
}

/* 2개의 컬럼 레이아웃 */
.form-column, .result-column {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 왼쪽 컬럼 */
.form-column {
  flex: 1;
  min-width: 400px;
}

/* 오른쪽 컬럼 */
.result-column {
  flex: 2;
}


/* --- 폼(왼쪽) 컬럼 --- */
.summary-header {
  margin-bottom: 32px;
  flex-shrink: 0;
}

.summary-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c2825;
  margin: 0 0 8px 0;
}

.summary-header p {
  font-size: 1rem;
  color: #888888;
  margin: 0;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2c2825;
  margin-bottom: 8px;
  font-size: 0.875rem;
}

select, input[type="text"] {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  background-color: #F8F8F8;
  color: #2c2825;
  transition: border-color 0.2s, box-shadow 0.2s;
}

select:focus, input[type="text"]:focus {
  outline: none;
  border-color: #E58A4E;
  box-shadow: 0 0 0 3px rgba(229, 138, 78, 0.2);
}

.primary-button {
  width: 100%;
  padding: 14px 20px;
  background-color: #E58A4E;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  margin-top: 16px;
}

.primary-button:hover:not(:disabled) {
  background-color: #c06c38;
}

.primary-button:disabled {
  background-color: #fbd6c0;
  cursor: not-allowed;
  transform: none;
}

/* --- 결과(오른쪽) 컬럼 --- */
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.result-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c2825;
  margin: 0;
}

.download-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.download-controls select {
  min-width: 150px;
  background-color: #FFFFFF;
}

.secondary-button {
  padding: 10px 20px;
  background-color: #4A5568;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.secondary-button:hover:not(:disabled) {
  background-color: #2D3748;
}

.secondary-button:disabled {
  background-color: #A0AEC0;
  cursor: not-allowed;
}

.document-editor {
  flex-grow: 1; 
  width: 100%;
  padding: 24px;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.7;
  resize: none;
  background-color: #F8F8F8;
  color: #374151;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  white-space: pre-wrap; /* 자동 줄바꿈 */
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
}

.document-editor:focus {
  outline: none;
  border-color: #E58A4E;
  box-shadow: 0 0 0 3px rgba(229, 138, 78, 0.2);
}

/* --- 버전 관리 섹션 (왼쪽 컬럼 내부) --- */
.version-management-section {
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid #eaeaea;
    display: flex;
    flex-direction: column;
    flex-grow: 1; /* 남은 공간을 모두 차지하도록 설정 */
    min-height: 0; /* flex-grow가 올바르게 작동하기 위해 필요 */
}

.version-header {
  margin-bottom: 24px;
  flex-shrink: 0;
}
.version-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c2825;
  margin: 0;
}
.save-version-form {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  flex-shrink: 0;
}
.version-list {
  flex-grow: 1;
  overflow-y: auto; /* 내용이 많아지면 스크롤 */
  padding-right: 10px;
  min-height: 150px;
}
.version-item {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: box-shadow 0.2s;
}
.version-item:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.version-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.version-item-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}
.version-item p {
  font-size: 0.9rem;
  color: #888;
  margin: 0 0 4px 0;
  word-break: keep-all;
}

/* --- 로딩 및 에러 --- */
.spinner-container {
  flex-grow: 1; 
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid rgba(229, 138, 78, 0.2);
  border-top-color: #E58A4E;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.error-message {
  padding: 16px;
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  margin-top: 1rem;
}

/* --- 반응형 --- */
@media (max-width: 1200px) {
  .summary-page-container {
    flex-direction: column;
    height: auto;
    gap: 24px;
  }
  .form-column, .result-column {
    max-height: none;
    flex-basis: auto;
  }
}
`;


const PlanPage = () => {
    // --- 상태(State) 관리 ---
    const [conceptList, setConceptList]= useState([]);
    const [conceptId, setConceptId] = useState('');
    const [planId, setPlanId] = useState(null);
    const [planContent, setPlanContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadFormat, setDownloadFormat] = useState('md');
    
    // 버전 관리 상태
    const [versions, setVersions] = useState([]);
    const [versionName, setVersionName] = useState('');
    const [versionMemo, setVersionMemo] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // --- 데이터 Fetching 및 처리 ---

    // 컨셉 목록 불러오기 (최초 1회 실행)
    useEffect(() => {
        const fetchConcepts = async () => {
            setError(null);
            try {
                const response = await fetch('http://localhost:8080/api/plans/concepts-for-summary');
                if (!response.ok) throw new Error('컨셉 목록을 불러오는 데 실패했습니다.');
                const data = await response.json();
                setConceptList(data);
                if (data.length > 0) setConceptId(data[0].conceptId);
            } catch (err) {
                setError('컨셉 목록을 가져올 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
            }
        };
        fetchConcepts();
    }, []);

    // 기획서 버전 목록 불러오는 함수
    const fetchVersions = async (currentPlanId) => {
        if (!currentPlanId) return;
        try {
            const response = await fetch(`http://localhost:8080/api/plans/${currentPlanId}/versions`);
            if (!response.ok) throw new Error('버전 목록을 불러오는 데 실패했습니다.');
            const data = await response.json();
            setVersions(data.versions);
        } catch (err) {
            alert(err.message);
        }
    };

    // 마크다운 텍스트를 보고서 형식으로 변환하는 함수
    const formatToReport = (rawText) => {
        if (!rawText) return '';
        let processedText = rawText.replace(/\*\*/g, ''); // 굵은 글씨 제거
        let sectionCounter = 1;
        const lines = processedText.split('\n');
        const formattedLines = lines.map(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('## ')) {
                const content = trimmedLine.replace(/^##\s*\d*\.?\s*/, '');
                return `${sectionCounter++}. ${content}`;
            }
            if (trimmedLine.startsWith('* ')) {
                return `  - ${trimmedLine.substring(2)}`;
            }
            if (trimmedLine.startsWith('# ')) {
                return `[ ${trimmedLine.substring(2)} ]`;
            }
            return line;
        });
        return formattedLines.join('\n');
    };

    // --- 이벤트 핸들러 ---
    
    // 기획서 생성 버튼 클릭
    const handleGenerateSummary = async (e) => {
        e.preventDefault();
        if (!conceptId) {
            setError('먼저 기획 컨셉을 선택해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setPlanContent('');
        setVersions([]);
        setPlanId(null);

        try {
            const response = await fetch('http://localhost:8080/api/plans/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conceptId: parseInt(conceptId) }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '기획서 생성 중 서버 오류가 발생했습니다.');
            }
            const data = await response.json(); // { planId, summaryText }
            
            // AI 응답이 중첩된 JSON일 경우를 대비한 파싱 로직
            let finalSummaryText = data.summaryText;
            try {
              const nestedData = JSON.parse(finalSummaryText);
              if (nestedData && typeof nestedData.summaryText === 'string') {
                finalSummaryText = nestedData.summaryText;
              }
            } catch (e) {
              // 파싱 실패 시, 일반 문자열로 간주
            }
            
            setPlanId(data.planId);
            setPlanContent(formatToReport(finalSummaryText));
            fetchVersions(data.planId);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // 버전 저장 버튼 클릭
    const handleSaveVersion = async (e) => {
        e.preventDefault();
        if (!versionName.trim()) {
            alert('버전 이름을 입력해주세요.');
            return;
        }
        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:8080/api/plans/version/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    versionName,
                    memo: versionMemo,
                    planContent,
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || '버전 저장에 실패했습니다.');
            
            alert(result.message);
            setVersionName('');
            setVersionMemo('');
            fetchVersions(planId);
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // 롤백 버튼 클릭
    const handleRollback = async (versionId, versionName) => {
        if (!window.confirm(`'${versionName}' 버전으로 기획서를 되돌리시겠습니까? 현재 수정 중인 내용은 덮어씌워집니다.`)) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/plans/${planId}/rollback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionId }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || '롤백에 실패했습니다.');
            
            alert(result.message);
            setPlanContent(formatToReport(result.rolledBackContent));

        } catch (err) {
            alert(err.message);
        }
    };

    // --- 파일 다운로드 관련 함수 ---
    const triggerDownload = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const downloadAsMarkdown = () => {
        const blob = new Blob([planContent], { type: 'text/markdown;charset=utf-8' });
        triggerDownload(blob, 'boardgame-plan.md');
    };

    const downloadAsDocx = () => {
        const paragraphs = planContent.split('\n').map(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
                return new Paragraph({ text: trimmedLine.slice(2, -2).trim(), heading: HeadingLevel.HEADING_1, style: "Heading1" });
            }
            if (/^\d+\.\s/.test(trimmedLine)) {
                return new Paragraph({ text: trimmedLine.substring(trimmedLine.indexOf(' ') + 1), heading: HeadingLevel.HEADING_2, style: "Heading2" });
            }
            if (trimmedLine.startsWith('- ')) {
                 return new Paragraph({ text: trimmedLine.substring(2), bullet: { level: 0 } });
            }
            return new Paragraph(line);
        });
        const doc = new Document({ 
            sections: [{ 
                properties: {}, 
                children: paragraphs 
            }],
            styles: {
                paragraphStyles: [
                    { id: "Heading1", name: "Heading 1", run: { size: 32, bold: true }, paragraph: { spacing: { before: 240, after: 120 } } },
                    { id: "Heading2", name: "Heading 2", run: { size: 26, bold: true }, paragraph: { spacing: { before: 200, after: 100 } } }
                ]
            }
        });
        Packer.toBlob(doc).then(blob => triggerDownload(blob, 'boardgame-plan.docx'));
    };
    
    const handleDownload = () => {
        if (!planContent) {
            alert('다운로드할 내용이 없습니다.');
            return;
        }
        switch (downloadFormat) {
            case 'md': downloadAsMarkdown(); break;
            case 'docx': downloadAsDocx(); break;
            default: alert('지원하지 않는 형식입니다.');
        }
    };


    return (
        <>
            <style>{PlanPageStyles}</style>
            <div className="summary-page-container">
                {/* --- 왼쪽 컬럼 (생성 + 버전 관리) --- */}
                <div className="form-column">
                    <div> {/* 스크롤 영역에서 제외될 상단 컨텐츠 */}
                        <header className="summary-header">
                            <h1>AI 게임 기획서 생성</h1>
                            <p>컨셉을 선택하면, AI가 데이터를 종합하여 기획서를 작성합니다.</p>
                        </header>
                        <form onSubmit={handleGenerateSummary}>
                            <div className="form-group">
                                <label htmlFor="conceptId">컨셉 선택</label>
                                <select
                                    id="conceptId"
                                    value={conceptId}
                                    onChange={(e) => setConceptId(e.target.value)}
                                    disabled={conceptList.length === 0 || isLoading}
                                    required
                                >
                                    {conceptList.length === 0 ? (
                                        <option value="" disabled>-- 불러올 컨셉이 없습니다 --</option>
                                    ) : (
                                        <>
                                        <option value="" disabled>-- 기획 컨셉을 선택하세요 --</option>
                                        {conceptList.map(concept => (
                                            <option key={concept.conceptId} value={concept.conceptId}>
                                                ID: {concept.conceptId} - {concept.theme}
                                            </option>
                                        ))}
                                        </>
                                    )}
                                </select>
                            </div>
                            <button type="submit" className="primary-button" disabled={isLoading || !conceptId}>
                                {isLoading ? 'AI가 기획서 작성 중...' : '기획서 생성 및 업데이트'}
                            </button>
                            {error && <p className="error-message">{error}</p>}
                        </form>
                    </div>

                    {/* 버전 관리 섹션 */}
                    {planId && (
                        <div className="version-management-section">
                            <div className="version-header">
                                <h2>버전 관리</h2>
                            </div>
                            <form className="save-version-form" onSubmit={handleSaveVersion}>
                                <div className="form-group">
                                    <label htmlFor="versionName">버전 이름</label>
                                    <input type="text" id="versionName" value={versionName} onChange={e => setVersionName(e.target.value)} placeholder="예: v1.1 - 밸런스 수정" required/>
                                </div>
                                <div className="form-group" style={{marginBottom: 0}}>
                                    <label htmlFor="versionMemo">메모 (선택)</label>
                                    <input type="text" id="versionMemo" value={versionMemo} onChange={e => setVersionMemo(e.target.value)} placeholder="수정 내용 요약"/>
                                </div>
                                <button type="submit" className="primary-button" disabled={isSaving}>
                                    {isSaving ? "저장 중..." : "현재 내용 버전으로 저장"}
                                </button>
                            </form>
                            
                            <div className="version-list">
                                {versions.length > 0 ? versions.map(v => (
                                    <div key={v.versionId} className="version-item">
                                        <div className="version-item-header">
                                            <h3>{v.versionName}</h3>
                                            <button className="secondary-button" onClick={() => handleRollback(v.versionId, v.versionName)}>롤백</button>
                                        </div>
                                        {v.memo && <p><strong>메모:</strong> {v.memo}</p>}
                                        <p><strong>저장일:</strong> {new Date(v.createdAt).toLocaleString('ko-KR')}</p>
                                    </div>
                                )) : <p style={{textAlign: 'center', color: '#888', marginTop: '2rem'}}>저장된 버전이 없습니다.</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- 오른쪽 결과 컬럼 --- */}
                <div className="result-column">
                    <div className="result-header">
                        <h2>생성된 기획서 (직접 수정 가능)</h2>
                        <div className="download-controls">
                            <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
                                <option value="md">Markdown (.md)</option>
                                <option value="docx">Word (.docx)</option>
                            </select>
                            <button type="button" className="secondary-button" onClick={handleDownload} disabled={!planContent || isLoading}>
                                다운로드
                            </button>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="spinner-container"><div className="spinner"></div></div>
                    ) : (
                        <textarea
                            id="documentEditor"
                            className="document-editor"
                            value={planContent}
                            onChange={(e) => setPlanContent(e.target.value)}
                            placeholder="기획서를 생성하면 결과가 여기에 표시됩니다. 자유롭게 수정하세요."
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default PlanPage;
