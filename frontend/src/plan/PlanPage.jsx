import React, { useState, useEffect } from 'react';
// 파일 생성을 위한 라이브러리들입니다.
// 터미널에 아래 명령어를 실행하여 설치해주세요.
// npm install jspdf html2canvas docx
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';

import './PlanPage.css'; 

// 사용자 친화적인 UI를 위한 기본 스타일을 추가합니다.
const styles = `
.summary-page-container {
    font-family: 'Pretendard', sans-serif;
    max-width: 900px;
    margin: 2rem auto;
    padding: 1rem;
    color: #333;
}

.summary-header h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    text-align: center;
    margin-bottom: 0.5rem;
}

.summary-header p {
    text-align: center;
    color: #7f8c8d;
    margin-bottom: 2rem;
}

.card {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    padding: 2rem;
    margin-bottom: 2rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #34495e;
}

select {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #bdc3c7;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

select:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.form-controls-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    align-items: flex-end;
}

.button-group {
    display: flex;
    gap: 1rem;
}

.primary-button, .secondary-button {
    flex-grow: 1;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    white-space: nowrap;
}

.primary-button {
    color: #fff;
    background: linear-gradient(45deg, #3498db, #2980b9);
    box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

.secondary-button {
    color: #fff;
    background: linear-gradient(45deg, #2ecc71, #27ae60);
    box-shadow: 0 4px 10px rgba(46, 204, 113, 0.3);
}


.primary-button:disabled, .secondary-button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    box-shadow: none;
}

.primary-button:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
}

.secondary-button:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(46, 204, 113, 0.4);
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 2rem auto;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-message {
    color: #e74c3c;
    background-color: #fbeae5;
    border: 1px solid #e74c3c;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
}

.document-editor {
    width: 100%;
    min-height: 500px;
    padding: 1.5rem;
    border: 1px solid #dfe4ea;
    border-radius: 8px;
    font-size: 1rem;
    line-height: 1.8;
    resize: vertical;
    transition: border-color 0.2s, box-shadow 0.2s;
    background-color: #f8f9fa;
}

.document-editor:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}
`;

const PlanPage = () => {
    const [conceptList, setConceptList] = useState([]);
    const [conceptId, setConceptId] = useState('');
    const [planContent, setPlanContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // --- 다운로드 포맷 선택을 위한 상태 추가 ---
    const [downloadFormat, setDownloadFormat] = useState('md');

    useEffect(() => {
        const fetchConcepts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:8080/api/plans/concepts-for-summary');
                if (!response.ok) throw new Error('컨셉 목록을 불러오는 데 실패했습니다.');
                const data = await response.json();
                setConceptList(data);
                if (data.length > 0) setConceptId(data[0].conceptId);
            } catch (err) {
                setError('컨셉 목록을 가져올 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
            } finally {
                setIsLoading(false);
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
            setPlanContent(data.summaryText);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 통합 다운로드 핸들러 함수 ---
    const handleDownload = () => {
        if (!planContent) {
            alert('다운로드할 내용이 없습니다.');
            return;
        }

        switch (downloadFormat) {
            case 'md':
                downloadAsMarkdown();
                break;
            case 'pdf':
                downloadAsPdf();
                break;
            case 'docx':
                downloadAsDocx();
                break;
            case 'hwp':
                downloadAsHwp();
                break;
            default:
                alert('지원하지 않는 형식입니다.');
        }
    };
    
    // --- 파일 다운로드를 위한 공통 함수 ---
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

    // --- 포맷별 다운로드 함수 구현 ---
    const downloadAsMarkdown = () => {
        const blob = new Blob([planContent], { type: 'text/markdown;charset=utf-8' });
        triggerDownload(blob, 'boardgame-plan.md');
    };

    const downloadAsPdf = () => {
        const input = document.getElementById('documentEditor'); // PDF로 변환할 DOM 요소
        if (!input) return;
        
        // 로딩 상태를 표시하여 사용자에게 변환 중임을 알릴 수 있습니다.
        alert('PDF 변환을 시작합니다. 내용이 많을 경우 시간이 걸릴 수 있습니다.');

        html2canvas(input, {
            scale: 2, // 해상도를 높여 글자가 깨지는 현상을 방지
            useCORS: true,
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const height = pdfWidth / ratio;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
            pdf.save('boardgame-plan.pdf');
        });
    };

    const downloadAsDocx = () => {
        const paragraphs = planContent.split('\n').map(line => {
            if (line.startsWith('# ')) {
                return new Paragraph({ text: line.substring(2), heading: HeadingLevel.HEADING_1 });
            }
            if (line.startsWith('## ')) {
                return new Paragraph({ text: line.substring(3), heading: HeadingLevel.HEADING_2 });
            }
            if (line.startsWith('* ')) {
                return new Paragraph({ text: line.substring(2), bullet: { level: 0 } });
            }
            return new Paragraph(line);
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs,
            }],
        });

        Packer.toBlob(doc).then(blob => {
            triggerDownload(blob, 'boardgame-plan.docx');
        });
    };

    const downloadAsHwp = () => {
        alert('HWP 파일은 텍스트 형식으로 다운로드됩니다. 한컴오피스에서 "불러오기" 기능을 사용하여 파일을 열어주세요.');
        const blob = new Blob([planContent], { type: 'text/plain;charset=utf-8' });
        triggerDownload(blob, 'boardgame-plan.hwp');
    };

    return (
        <>
            <style>{styles}</style>
            <div className="summary-page-container">
                <header className="summary-header">
                    <h1>AI 게임 기획서 생성</h1>
                    <p>컨셉을 선택하고 버튼을 누르면, AI가 모든 기획 데이터를 종합하여 완성된 기획서를 작성합니다.</p>
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
                        <div className="button-group">
                            <button type="submit" className="primary-button" disabled={isLoading}>
                                {isLoading ? 'AI가 기획서 작성 중...' : '기획서 생성하기'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="summary-document-view card">
                    <div className="form-controls-grid">
                         <h2>생성된 기획서 (직접 수정 가능)</h2>
                         <div className="button-group">
                            <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
                                <option value="md">Markdown (.md)</option>
                                <option value="pdf">PDF (.pdf)</option>
                                <option value="docx">Word (.docx)</option>
                                <option value="hwp">한글 (.hwp)</option>
                            </select>
                            <button type="button" className="secondary-button" onClick={handleDownload} disabled={!planContent}>
                                다운로드
                            </button>
                         </div>
                    </div>
                    
                    <textarea
                        id="documentEditor" // PDF 변환을 위해 ID 추가
                        className="document-editor"
                        value={planContent}
                        onChange={(e) => setPlanContent(e.target.value)}
                        placeholder="기획서를 생성하면 결과가 여기에 표시됩니다. 자유롭게 수정하세요."
                        disabled={isLoading}
                    />
                </div>
            </div>
        </>
    );
};

export default PlanPage;
