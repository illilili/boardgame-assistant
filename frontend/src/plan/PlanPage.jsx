import React, { useState, useEffect } from 'react';
// 파일 생성을 위한 라이브러리들입니다.
// 터미널에 아래 명령어를 실행하여 설치해주세요.
// npm install jspdf html2canvas docx
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';

// CSS를 React 컴포넌트 내에 <style> 태그로 포함시켰습니다.
// 이렇게 하면 별도의 CSS 파일 없이 이 파일 하나만으로 스타일이 적용됩니다.
const PlanPageStyles = `
/* PlanPage.css (Architect 스타일에 맞춤 - 최종 수정본) */

/* --- 전체 레이아웃 --- */
.summary-page-container {
  display: flex;
  gap: 48px;
  width: 100%;
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
  height: calc(100vh - 70px - 4rem);
  box-sizing: border-box;
}

.form-column, .result-column {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  max-height: 100%;
  box-sizing: border-box;
}

.form-column {
  flex: 1; /* 왼쪽 컬럼은 1의 비율 */
  min-width: 350px;
}

.result-column {
  flex: 2; /* 오른쪽 컬럼을 2의 비율로 설정해 더 넓게 만듭니다. */
}


/* --- 폼(왼쪽) 컬럼 --- */
.summary-header {
  margin-bottom: 32px;
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

select {
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

select:focus {
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
  flex-shrink: 0; /* 컬럼 크기가 줄어들 때 헤더는 줄어들지 않도록 설정 */
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
  padding: 12px 24px;
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
}

.document-editor:focus {
  outline: none;
  border-color: #E58A4E;
  box-shadow: 0 0 0 3px rgba(229, 138, 78, 0.2);
}

/* --- 로딩 및 에러 상태 --- */
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

/* --- 반응형 디자인 --- */
@media (max-width: 992px) {
  .summary-page-container {
    flex-direction: column;
    height: auto;
    gap: 24px;
  }
  .form-column, .result-column {
    max-height: none;
  }
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .download-controls {
    width: 100%;
  }
  .download-controls select {
    flex-grow: 1;
  }
}
`;

const PlanPage = () => {
    const [conceptList, setConceptList] = useState([]);
    const [conceptId, setConceptId] = useState('');
    const [planContent, setPlanContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadFormat, setDownloadFormat] = useState('md');

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

    const handleGenerateSummary = async (e) => {
        e.preventDefault();
        if (!conceptId) {
            setError('먼저 기획 컨셉을 선택해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setPlanContent('');

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
            const data = await response.json();
            
            // ★★★ 수정된 부분: 마크다운 기호를 보고서 형식으로 변환 ★★★
            const rawText = data.summaryText;
            let processedText = rawText.replace(/\*\*/g, ''); // 굵은 글씨 제거

            let sectionCounter = 1;
            const lines = processedText.split('\n');
            const formattedLines = lines.map(line => {
                const trimmedLine = line.trim();
                // '##'로 시작하는 소제목 처리
                if (trimmedLine.startsWith('## ')) {
                    // "## 1. 제목" 또는 "## 제목" 형태에서 '##' 및 앞의 숫자/공백 제거
                    const content = trimmedLine.replace(/^##\s*\d*\.?\s*/, '');
                    return `${sectionCounter++}. ${content}`;
                }
                // '*'로 시작하는 리스트 항목을 '  - ' 형식으로 변경
                if (trimmedLine.startsWith('* ')) {
                    return `  - ${trimmedLine.substring(2)}`;
                }
                // '#'로 시작하는 메인 제목을 '[ 제목 ]' 형식으로 변경
                if (trimmedLine.startsWith('# ')) {
                    return `[ ${trimmedLine.substring(2)} ]`;
                }
                return line;
            });
            
            const finalText = formattedLines.join('\n');
            setPlanContent(finalText);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

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

    const downloadAsPdf = () => {
        const input = document.getElementById('documentEditor');
        if (!input) return;
        alert('PDF 변환을 시작합니다. 내용이 많을 경우 시간이 걸릴 수 있습니다.');
        html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const height = pdfWidth / ratio;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
            pdf.save('boardgame-plan.pdf');
        });
    };

    const downloadAsDocx = () => {
        // 변환된 보고서 형식에 맞춰 Docx 생성 로직 수정
        const paragraphs = planContent.split('\n').map(line => {
            const trimmedLine = line.trim();
            // H1: [ Title ]
            if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
                return new Paragraph({ text: trimmedLine.slice(2, -2), heading: HeadingLevel.HEADING_1 });
            }
            // H2: 1. Title, 2. Title ...
            if (/^\d+\.\s/.test(trimmedLine)) {
                return new Paragraph({ text: trimmedLine.substring(trimmedLine.indexOf(' ') + 1), heading: HeadingLevel.HEADING_2 });
            }
            // Bullet: - item
            if (trimmedLine.startsWith('- ')) {
                 return new Paragraph({ text: trimmedLine.substring(2), bullet: { level: 0 } });
            }
            return new Paragraph(line);
        });
        const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
        Packer.toBlob(doc).then(blob => triggerDownload(blob, 'boardgame-plan.docx'));
    };
    
    const downloadAsHwp = () => {
        alert('HWP 파일은 텍스트 형식으로 다운로드됩니다. 한컴오피스에서 "불러오기" 기능을 사용하여 파일을 열어주세요.');
        const blob = new Blob([planContent], { type: 'text/plain;charset=utf-8' });
        triggerDownload(blob, 'boardgame-plan.hwp');
    };

    const handleDownload = () => {
        if (!planContent) {
            alert('다운로드할 내용이 없습니다.');
            return;
        }
        switch (downloadFormat) {
            case 'md': downloadAsMarkdown(); break;
            case 'pdf': downloadAsPdf(); break;
            case 'docx': downloadAsDocx(); break;
            case 'hwp': downloadAsHwp(); break;
            default: alert('지원하지 않는 형식입니다.');
        }
    };

    return (
        <>
            <style>{PlanPageStyles}</style>
            <div className="summary-page-container">
                {/* --- 왼쪽 폼 컬럼 --- */}
                <div className="form-column">
                    <header className="summary-header">
                        <h1>AI 게임 기획서 생성</h1>
                        <p>컨셉을 선택하고 버튼을 누르면, AI가 모든 기획 데이터를 종합하여 완성된 기획서를 작성합니다.</p>
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
                        
                        {error && <p className="error-message">{error}</p>}
                    </form>
                </div>

                {/* --- 오른쪽 결과 컬럼 (수정된 구조) --- */}
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
                        <div className="spinner-container">
                            <div className="spinner"></div>
                        </div>
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
