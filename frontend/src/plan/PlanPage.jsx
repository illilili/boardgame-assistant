import React, { useState, useEffect, useContext } from 'react';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import {
    getConceptsForSummary, generateSummary,
    savePlanVersion, getPlanVersions, rollbackPlanVersion,
    submitPlan, checkPlanCopyright, getPlanDetail
} from '../api/auth';
import PlanReport from './PlanReport';
import { ProjectContext } from '../contexts/ProjectContext';
import CopyrightModal from './CopyrightModal';
import VersionHistoryModal from './VersionHistoryModal';
import SubmissionModal from './SubmissionModal';

// 컴포넌트의 모든 스타일을 포함하는 템플릿 리터럴
const PlanPageStyles = `
/* --- 전체 레이아웃 (2단 구조) --- */
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
/* 왼쪽 컬럼 */
.form-column {
    /* flex: 1.2; -> flex: 1.5; 로 수정 */
    flex: 1.5;
    min-width: 300px; /* 최소 너비를 확보하여 내용이 깨지지 않게 함 */
    overflow-y: auto;
    min-height: 0;  
}
/* 오른쪽 컬럼 */
.result-column {
    /* flex: 2; -> flex: 4; 로 수정 */
    flex: 4;
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

select, input[type="text"], input[type="file"] {
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

select:focus, input[type="text"]:focus, input[type="file"]:focus {
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
    padding: 14px 20px;
    background-color: #4A5568;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
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
    margin: 1rem 0;
}

.success-message {
    padding: 16px;
    background-color: #f0fff4;
    color: #065f46;
    border: 1px solid #6ee7b7;
    border-radius: 8px;
    text-align: center;
    font-weight: 500;
    margin: 1rem 0;
}
/* 파일 선택 버튼 스타일 */
input[type="file"]::file-selector-button,
input[type="file"]::-webkit-file-upload-button {
  background: #374151;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease, transform 0.1s ease;
}

input[type="file"]::file-selector-button:hover {
  background: #1f2937;
}

input[type="file"]::file-selector-button:active {
  background: #4b5563;
  transform: translateY(0) scale(0.95);
}

/* 새 버튼 스타일 */
.reget-button {
    padding: 14px 20px;
    background-color: #FFFFFF;
    color: #2b3a61ff;
    border: 1px solid #D1D5DB;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;
    white-space: nowrap;
}

.reget-button:hover:not(:disabled) {
    background-color: #F9FAFB;
    border-color: #9CA3AF;
    color: #2c3246ff;
}

/* --- 모달 스타일 --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 16px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #E58A4E, #E58A4E); /* 남색 그라데이션 */
  color: #FFFFFF; /* 글자색을 흰색으로 변경 */
  border: none; /* 테두리 제거 */
}

.modal-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2c2825;
    margin: 0;
}

.modal-close-button {
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: 300;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  line-height: 1;
}

.modal-body {
    max-height: 70vh;
    overflow-y: auto;
}

.save-version-form {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
}
`;

const PlanPage = () => {
    const { projectId } = useContext(ProjectContext);

    const [conceptList, setConceptList] = useState([]);
    const [filteredConceptList, setFilteredConceptList] = useState([]);
    const [conceptId, setConceptId] = useState('');
    const [planId, setPlanId] = useState(null);
    const [planContent, setPlanContent] = useState('');
    const [versions, setVersions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState('md');
    const [isChecking, setIsChecking] = useState(false);
    const [showCopyright, setShowCopyright] = useState(false);
    const [copyrightResult, setCopyrightResult] = useState(null);

    // 모달 상태 분리
    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

    const clearMessages = () => {
        setError(null);
        setSuccessMessage('');
    };

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
        if (!projectId || conceptList.length === 0) {
            setFilteredConceptList([]);
            setConceptId('');
            setPlanContent('');
            setVersions([]);
            setPlanId(null);
            return;
        }

        const conceptsForProject = conceptList.filter(c => c.projectId === parseInt(projectId));
        setFilteredConceptList(conceptsForProject.sort((a, b) => b.conceptId - a.conceptId));
        if (conceptsForProject.length > 0) {
            setConceptId(conceptsForProject[0].conceptId.toString());
        } else {
            setConceptId('');
        }
    }, [projectId, conceptList]);

    useEffect(() => {
        if (!conceptId) return;

        const selectedConcept = conceptList.find(c => c.conceptId.toString() === conceptId);
        if (!selectedConcept) return;

        if (selectedConcept.planId) {
            setPlanId(selectedConcept.planId);
            getPlanDetail(selectedConcept.planId).then((data) => {
                setPlanContent(data.currentContent || "");
                fetchVersions(data.planId);
            });
        } else {
            setPlanId(null);
            setPlanContent("");
            setVersions([]);
        }
    }, [conceptId, conceptList]);

    useEffect(() => {
        if (!planId) return;
        const saved = localStorage.getItem(`copyright-${planId}`);
        if (saved) {
            setCopyrightResult(JSON.parse(saved));
        }
    }, [planId]);

    const handleGenerateSummary = async (e) => {
        e.preventDefault();
        if (!conceptId) {
            setError('먼저 컨셉을 선택해야 합니다.');
            return;
        }

        setIsLoading(true);
        clearMessages();
        setIsEditMode(false);
        setPlanContent('');
        setVersions([]);
        setPlanId(null);

        try {
            const data = await generateSummary(conceptId);
            let finalSummaryText = data.summaryText;
            try {
                const nestedData = JSON.parse(finalSummaryText);
                if (nestedData && typeof nestedData.summaryText === 'string') {
                    finalSummaryText = nestedData.summaryText;
                }
            } catch (e) { /* 파싱 실패 시 원본 사용 */ }

            setPlanId(data.planId);
            setPlanContent(finalSummaryText);

            await savePlanVersion({
                planId: data.planId,
                versionName: "AI 기획서 초안",
                memo: "AI가 생성한 기획서 초안입니다.",
                planContent: finalSummaryText
            });
            await fetchVersions(data.planId);
            setSuccessMessage('새로운 기획서가 생성되고 초안이 저장되었습니다.');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchVersions = async (currentPlanId) => {
        if (!currentPlanId) return;
        try {
            const data = await getPlanVersions(currentPlanId);
            setVersions(data.versions);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSaveVersion = async ({ versionName, versionMemo }) => {
        if (!planId) {
            setError('기획서가 먼저 생성되어야 합니다.');
            return;
        }
        if (!versionName.trim()) {
            setError('버전 이름을 입력해주세요.');
            return;
        }
        setIsSaving(true);
        clearMessages();
        try {
            const result = await savePlanVersion({ planId, versionName, memo: versionMemo, planContent });
            setSuccessMessage(result.message);
            await fetchVersions(planId);
            setIsEditMode(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRollback = async (versionId, versionName) => {
        if (!window.confirm(`'${versionName}' 버전으로 기획서를 되돌리시겠습니까? 현재 수정 중인 내용은 사라집니다.`)) {
            return;
        }
        clearMessages();
        try {
            const result = await rollbackPlanVersion(planId, { versionId });
            setPlanContent(result.rolledBackContent);
            setIsEditMode(false);
            setSuccessMessage(result.message);
            setIsVersionModalOpen(false); // 성공 시 모달 닫기
        } catch (err) {
            setError(err.message);
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
                return `    - ${trimmedLine.substring(2)}`;
            }
            if (trimmedLine.startsWith('# ')) {
                return `[ ${trimmedLine.substring(2)} ]`;
            }
            return line;
        });
        return formattedLines.join('\n');
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
            sections: [{ properties: {}, children: paragraphs }],
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
            setError('다운로드할 내용이 없습니다.');
            return;
        }
        switch (downloadFormat) {
            case 'md': downloadAsMarkdown(); break;
            case 'docx': downloadAsDocx(); break;
            default: setError('지원하지 않는 형식입니다.');
        }
    };

    const handleCheckCopyright = async () => {
        if (!planId || !planContent) {
            setError("먼저 기획서를 생성하세요.");
            return;
        }
        setIsChecking(true);
        clearMessages();
        try {
            const result = await checkPlanCopyright(planId, planContent);
            setCopyrightResult(result);
            localStorage.setItem(`copyright-${planId}`, JSON.stringify(result));
            setShowCopyright(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsChecking(false);
        }
    };

    const handleSubmit = async (submissionFile, onReset) => {
        if (!planId) {
            setError('제출할 기획안을 먼저 생성해야 합니다.');
            return;
        }
        if (!submissionFile) {
            setError('제출할 파일을 선택해야 합니다.');
            return;
        }
        setIsSubmitting(true);
        clearMessages();
        try {
            const result = await submitPlan(planId, submissionFile);
            setSuccessMessage(`기획안 ID ${result.planId}이 성공적으로 제출되었습니다!`);
            onReset(); // 성공 시 모달 폼 리셋
        } catch (err) {
            setError(`제출 실패: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <style>{PlanPageStyles}</style>
            <div className="summary-page-container">
                {/* ---------------- 왼쪽 컬럼 ---------------- */}
                <div className="form-column">
                    <header className="summary-header">
                        <h1>AI 게임 기획서 생성</h1>
                        <p>컨셉을 선택하면, AI가 데이터를 종합하여 기획서를 작성합니다.</p>
                    </header>

                    {successMessage && !isVersionModalOpen && !isSubmissionModalOpen && <p className="success-message">{successMessage}</p>}
                    {error && !isVersionModalOpen && !isSubmissionModalOpen && <p className="error-message">{error}</p>}

                    <form onSubmit={handleGenerateSummary} id="generate-plan-form" style={{ marginBottom: '24px' }}>
                        <div className="form-group">
                            <label htmlFor="conceptId">컨셉 선택</label>
                            <select
                                id="conceptId"
                                value={conceptId}
                                onChange={(e) => setConceptId(e.target.value)}
                                disabled={filteredConceptList.length === 0 || isLoading}
                                required
                            >
                                {filteredConceptList.length > 0 ? (
                                    filteredConceptList.map(concept => (
                                        <option key={concept.conceptId} value={concept.conceptId}>
                                            ID: {concept.conceptId} - {concept.theme}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>
                                        -- 이 프로젝트에 생성된 컨셉이 없습니다 --
                                    </option>
                                )}
                            </select>
                        </div>

                        <button type="submit" form="generate-plan-form" className="primary-button" style={{ marginTop: 0 }} disabled={isLoading || !conceptId}>
                            {isLoading ? "생성 중..." : planId ? "기획서 재생성" : "AI 기획서 생성"}
                        </button>
                    </form>

                    {planId && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #eaeaea', paddingTop: '24px' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#2c2825', margin: 0 }}>부가 기능 및 제출</h2>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    style={{ flex: 1, width: 'auto' }}
                                    onClick={handleCheckCopyright}
                                    disabled={isChecking || !planContent}
                                >
                                    {isChecking ? "검사 중..." : "저작권 검사"}
                                </button>

                                <button
                                    type="button"
                                    className="secondary-button"
                                    style={{ flex: 1, width: 'auto' }}
                                    onClick={() => { clearMessages(); setIsVersionModalOpen(true); }}
                                >
                                    버전 관리
                                </button>
                            </div>

                            {copyrightResult && (
                                <button
                                    type="button"
                                    className="reget-button"
                                    onClick={() => setShowCopyright(true)}
                                >
                                    저작권 분석 결과 다시보기
                                </button>
                            )}

                            <button
                                type="button"
                                className="primary-button"
                                onClick={() => { clearMessages(); setIsSubmissionModalOpen(true); }}
                            >
                                최종 제출
                            </button>
                        </div>
                    )}

                </div>

                {/* ---------------- 오른쪽 컬럼 ---------------- */}
                <div className="result-column">
                    <div className="result-header">
                        <h2>생성된 기획서</h2>
                        <div className="download-controls">
                            <button
                                type="button"
                                className="secondary-button"
                                style={{ width: 'auto' }}
                                onClick={() => setIsEditMode(!isEditMode)}
                                disabled={!planContent}
                            >
                                {isEditMode ? "완료" : "수정하기"}
                            </button>
                            <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
                                <option value="md">Markdown (.md)</option>
                                <option value="docx">Word (.docx)</option>
                            </select>
                            <button
                                type="button"
                                className="secondary-button"
                                style={{ width: 'auto' }}
                                onClick={handleDownload}
                                disabled={!planContent || isLoading}
                            >
                                다운로드
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="spinner-container"><div className="spinner"></div></div>
                    ) : (
                        isEditMode ? (
                            <textarea
                                id="documentEditor"
                                className="document-editor"
                                value={planContent}
                                onChange={(e) => setPlanContent(e.target.value)}
                                placeholder="기획서 내용을 자유롭게 수정하세요."
                            />
                        ) : (
                            <div style={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
                                <PlanReport content={planContent} />
                            </div>
                        )
                    )}
                </div>
            </div>

            <CopyrightModal
                isOpen={showCopyright}
                onClose={() => setShowCopyright(false)}
                result={copyrightResult}
            />

            <VersionHistoryModal
                isOpen={isVersionModalOpen}
                onClose={() => setIsVersionModalOpen(false)}
                versions={versions}
                planContent={planContent}
                onSaveVersion={handleSaveVersion}
                onRollback={handleRollback}
                isSaving={isSaving}
                successMessage={successMessage}
                error={error}
            />

            <SubmissionModal
                isOpen={isSubmissionModalOpen}
                onClose={() => setIsSubmissionModalOpen(false)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                successMessage={successMessage}
                error={error}
            />
        </>
    );
};

export default PlanPage;