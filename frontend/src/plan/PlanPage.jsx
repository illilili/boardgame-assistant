import React, { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { getMyProjects, getConceptsForSummary, generateSummary, savePlanVersion, getPlanVersions, rollbackPlanVersion } from '../api/auth';
import PlanReport from './PlanReport'; 

const PlanPageStyles = `
/* --- 전체 레이아웃 (2단 구조) --- */
.summary-page-container {
    display: flex;
    gap: 24px;
    width: 100%;
    max-width: 1800px;
    margin: 0 auto;
    padding: 0;
    flex-grow: 1;
    min-height: 0; 
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
    white-space: pre-wrap;
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
    flex-grow: 1; 
    min-height: 0;
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
    const [projectList, setProjectList] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [conceptList, setConceptList] = useState([]);
    const [filteredConceptList, setFilteredConceptList] = useState([]);
    const [conceptId, setConceptId] = useState('');
    const [planId, setPlanId] = useState(null);
    const [planContent, setPlanContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadFormat, setDownloadFormat] = useState('md');
    
    const [versions, setVersions] = useState([]);
    const [versionName, setVersionName] = useState('');
    const [versionMemo, setVersionMemo] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [selectedVersionId, setSelectedVersionId] = useState('');

    // ✨ 1. 수정 모드를 위한 state 추가 (false는 보기 모드, true는 수정 모드)
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getMyProjects();
                setProjectList(data);
                if (data.length > 0) {
                    setSelectedProjectId(data[0].projectId.toString());
                }
            } catch (err) {
                console.error(err);
                setError('프로젝트 목록을 불러올 수 없습니다. 로그인이 유효한지 확인해주세요.');
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchAllConcepts = async () => {
            try {
                const data = await getConceptsForSummary();
                setConceptList(data);
            } catch (err) {
                setError(err.message || '컨셉 목록 로딩 실패');
            }
        };
        fetchAllConcepts();
    }, []);

    useEffect(() => {
        if (!selectedProjectId || conceptList.length === 0) {
            setFilteredConceptList([]);
            setConceptId('');
            return;
        }
        
        const conceptsForProject = conceptList.filter(c => c.projectId === parseInt(selectedProjectId));
        setFilteredConceptList(conceptsForProject.sort((a, b) => b.conceptId - a.conceptId));
        if (conceptsForProject.length > 0) {
            setConceptId(conceptsForProject[0].conceptId.toString());
        } else {
            setConceptId('');
        }
    }, [selectedProjectId, conceptList]);


    const fetchVersions = async (currentPlanId) => {
        if (!currentPlanId) return;
        try {
            const data = await getPlanVersions(currentPlanId);
            setVersions(data.versions);
        } catch (err) {
            alert(err.message);
        }
    };
    
    const formatToReport = (rawText) => {
        if (!rawText) return '';
        let processedText = rawText.replace(/\*\*/g, '');
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
        setIsEditMode(false); // ✨ 새 기획서 생성 시 보기 모드로 초기화

        try {
            const data = await generateSummary(conceptId);
            
            let finalSummaryText = data.summaryText;
            try {
                const nestedData = JSON.parse(finalSummaryText);
                if (nestedData && typeof nestedData.summaryText === 'string') {
                    finalSummaryText = nestedData.summaryText;
                }
            } catch (e) {}
            
            setPlanId(data.planId);
            setPlanContent(finalSummaryText);
            fetchVersions(data.planId);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveVersion = async (e) => {
        e.preventDefault();
        if (!planId) {
            alert('기획서가 먼저 생성되어야 합니다.');
            return;
        }
        if (!versionName.trim()) {
            alert('버전 이름을 입력해주세요.');
            return;
        }
        setIsSaving(true);
        try {
            const requestBody = {
                planId,
                versionName,
                memo: versionMemo,
                planContent,
            };
            const result = await savePlanVersion(requestBody);
            
            alert(result.message);
            setVersionName('');
            setVersionMemo('');
            fetchVersions(planId);
            setIsEditMode(false); // 버전 저장 후 보기 모드로 전환
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRollback = async (versionId, versionName) => {
        if (!window.confirm(`'${versionName}' 버전으로 기획서를 되돌리시겠습니까? 현재 수정 중인 내용은 덮어씌워집니다.`)) {
            setSelectedVersionId('');
            return;
        }
        try {
            const requestBody = { versionId };
            const result = await rollbackPlanVersion(planId, requestBody);
            
            alert(result.message);
            setPlanContent(result.rolledBackContent);
            setIsEditMode(false); // ✨ 롤백 후 보기 모드로 초기화
        } catch (err) {
            alert(err.message);
        } finally {
            setSelectedVersionId('');
        }
    };

    const handleVersionSelect = (e) => {
        const selectedId = e.target.value;
        if (!selectedId) return;

        const selectedVersion = versions.find(v => v.versionId.toString() === selectedId);
        if (selectedVersion) {
            setSelectedVersionId(selectedId);
            handleRollback(selectedVersion.versionId, selectedVersion.versionName);
        }
    };
    
    const downloadAsMarkdown = () => {
        const blob = new Blob([planContent], { type: 'text/markdown;charset=utf-8' });
        saveAs(blob, 'boardgame-plan.md');
    };
    
    const downloadAsDocx = () => {
        const reportText = formatToReport(planContent);

        const paragraphs = reportText.split('\n').map(line => {
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

        Packer.toBlob(doc).then(blob => saveAs(blob, 'boardgame-plan.docx'));
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
                    <div>
                        <header className="summary-header">
                            <h1>AI 게임 기획서 생성</h1>
                            <p>컨셉을 선택하면, AI가 데이터를 종합하여 기획서를 작성합니다.</p>
                        </header>
                        <form onSubmit={handleGenerateSummary}>
                            <div className="form-group">
                                <label htmlFor="project-select">프로젝트 선택</label>
                                <select
                                    id="project-select"
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
                                <label htmlFor="conceptId">컨셉 선택</label>
                                <select
                                    id="conceptId"
                                    value={conceptId}
                                    onChange={(e) => setConceptId(e.target.value)}
                                    disabled={filteredConceptList.length === 0 || isLoading}
                                    required
                                >
                                    {filteredConceptList.length === 0 ? (
                                        <option value="" disabled>-- 불러올 컨셉이 없습니다 --</option>
                                    ) : (
                                        <>
                                            {filteredConceptList.map(concept => (
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
                            
                            {versions.length > 0 && (
                                <div className="form-group" style={{marginTop: '24px'}}>
                                    <label htmlFor="version-select">저장된 버전 불러오기 (롤백)</label>
                                    <select
                                        id="version-select"
                                        value={selectedVersionId}
                                        onChange={handleVersionSelect}
                                    >
                                        <option value="">-- 롤백할 버전을 선택하세요 --</option>
                                        {versions.map(v => (
                                            <option key={v.versionId} value={v.versionId}>
                                                {v.versionName} ({new Date(v.createdAt).toLocaleDateString('ko-KR')})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- 오른쪽 결과 컬럼 --- */}
                <div className="result-column">
                    <div className="result-header">
                        <h2>생성된 기획서</h2>
                        <div className="download-controls">
                            {/* ✨ 2. 수정/완료 토글 버튼 추가 */}
                            <button 
                                type="button" 
                                className="secondary-button" 
                                onClick={() => setIsEditMode(!isEditMode)}
                                disabled={!planContent}
                            >
                                {isEditMode ? '완료' : '수정하기'}
                            </button>
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
                        // ✨ 3. isEditMode 상태에 따라 조건부 렌더링
                        isEditMode ? (
                            <textarea
                                id="documentEditor"
                                className="document-editor"
                                value={planContent}
                                onChange={(e) => setPlanContent(e.target.value)}
                                placeholder="기획서 내용을 자유롭게 수정하세요."
                            />
                        ) : (
                            <div style={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
                                <PlanReport content={planContent} />
                            </div>
                        )
                    )}
                </div>
            </div>
        </>
    );
};

export default PlanPage;