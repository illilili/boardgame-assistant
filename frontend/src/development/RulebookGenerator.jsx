// src/development/RulebookGenerator.jsx
import React, { useState } from "react";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { saveAs } from "file-saver";
import { marked } from "marked"; // 마크다운 파서
import { generateRulebook } from '../api/development';
import RulebookReport from "./RulebookReport";
import "./RulebookGenerator.css";

function RulebookGenerator({ contentId }) {
  const [rulebookText, setRulebookText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("docx");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const isFromList = Boolean(contentId);
  const [manualId, setManualId] = useState(contentId || "");
  const finalContentId = isFromList ? contentId : manualId;

  // 룰북 생성 요청
  const handleGenerate = async () => {
    if (!finalContentId) {
      setError("콘텐츠 ID를 입력하세요.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await generateRulebook({ contentId: Number(finalContentId) });
      setRulebookText(res.rulebookText || "");
      localStorage.setItem(`rulebook_${finalContentId}`, JSON.stringify(res));
    } catch (err) {
      console.error(err);
      setError("룰북 생성 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // 다운로드 (docx / md)
  const downloadAsMarkdown = () => {
    const blob = new Blob([rulebookText], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, "boardgame-rulebook.md");
  };

  const downloadAsDocx = () => {
    const tokens = marked.lexer(rulebookText); // 마크다운 → 토큰

    const paragraphs = [];

    tokens.forEach(token => {
      if (token.type === "heading") {
        paragraphs.push(
          new Paragraph({
            text: token.text,
            heading:
              token.depth === 1
                ? HeadingLevel.HEADING_1
                : token.depth === 2
                  ? HeadingLevel.HEADING_2
                  : HeadingLevel.HEADING_3,
          })
        );
      } else if (token.type === "paragraph") {
        paragraphs.push(new Paragraph(token.text));
      } else if (token.type === "list") {
        token.items.forEach(item => {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: item.text, bold: false })],
              bullet: { level: 0 },
            })
          );
        });
      }
    });

    const doc = new Document({ sections: [{ children: paragraphs }] });

    Packer.toBlob(doc).then(blob => saveAs(blob, "boardgame-rulebook.docx"));
  };

  const handleDownload = () => {
  if (!rulebookText) {
    setError("다운로드할 내용이 없습니다.");
    return;
  }
  if (downloadFormat === "md") {
    downloadAsMarkdown();
  } else {
    downloadAsDocx();
  }
};

  // PDF 제출
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("PDF 파일만 업로드 가능합니다.");
      e.target.value = "";
      return;
    }
    setSubmissionFile(file);
  };

  const handleSubmitPdf = async (e) => {
    e.preventDefault();
    if (!submissionFile) {
      setError("제출할 PDF 파일을 선택하세요.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("file", submissionFile);

      await fetch(`/api/content/${finalContentId}/submit-rulebook`, {
        method: "POST",
        body: formData,
      });

      setSuccessMessage("룰북 제출 성공!");
      setSubmissionFile(null);
    } catch {
      setError("룰북 제출 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rulebook-page-container">
      <div className="form-column">
        <h1>📖 룰북 생성</h1>
        <div className="id-input-container">
          <label>콘텐츠 ID</label>
          <input
            type="text"
            value={manualId}
            onChange={(e) => !isFromList && setManualId(e.target.value)}
            placeholder="콘텐츠 ID 입력"
            disabled={isFromList}
          />
        </div>

        <button
          className="primary-button"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? "생성 중..." : "룰북 생성하기"}
        </button>

        {rulebookText && (
          <>
            <div className="download-controls">
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value)}
              >
                <option value="docx">Word (.docx)</option>
                <option value="md">Markdown (.md)</option>
              </select>
              <button type="button" className="secondary-button" onClick={handleDownload}>
                다운로드
              </button>
            </div>

            <form className="submit-section" onSubmit={handleSubmitPdf}>
              <label>PDF 파일 제출</label>
              <input type="file" accept="application/pdf" onChange={handleFileChange} />
              <button
                className="primary-button"
                type="submit"
                disabled={isLoading || !submissionFile}
              >
                제출하기
              </button>
            </form>
          </>
        )}

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>

      <div className="result-column">
        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          // 기존 <pre> 대신 Markdown 렌더링
          <RulebookReport content={rulebookText} />
        )}
      </div>
    </div>
  );
}

export default RulebookGenerator;
