import React, { useState, useEffect } from "react";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { generateRulebook } from '../api/development'; // getRulebookPreview 추가 가능
import RulebookReport from "./RulebookReport";
import "./RulebookGenerator.css";

function RulebookGenerator({ contentId }) {
  const [rulebookText, setRulebookText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const isFromList = Boolean(contentId);
  const [manualId, setManualId] = useState(contentId || "");
  const finalContentId = isFromList ? contentId : manualId;

  /** 📌 초기 로드 시 기존 저장된 룰북 불러오기 */
  useEffect(() => {
    if (!finalContentId) return;

    (async () => {
      try {
        // 1) 로컬스토리지에서 읽기
        const saved = localStorage.getItem(`rulebook_${finalContentId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setRulebookText(parsed.rulebookText || "");
        }

        // 2) (선택) 서버에서 미리보기 불러오기
        // const preview = await getRulebookPreview(finalContentId);
        // if (preview?.rulebookText) {
        //   setRulebookText(preview.rulebookText);
        // }
      } catch (err) {
        console.error(err);
        setError("룰북 데이터 불러오기 실패");
      }
    })();
  }, [finalContentId]);

  /** 룰북 생성 요청 */
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

  /** 다운로드 */
  const handleDownload = () => {
    if (!rulebookText) {
      setError("다운로드할 내용이 없습니다.");
      return;
    }
    downloadAsDocx();
  };

  /** docx 변환 */
  const downloadAsDocx = () => {
    if (!rulebookText) return;

    const reportText = rulebookText
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/_/g, "");

    const lines = reportText.split("\n");
    const paragraphs = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        return new Paragraph({
          text: trimmed.replace(/^#\s*/, ""),
          heading: HeadingLevel.HEADING_1,
        });
      }
      if (trimmed.startsWith("## ")) {
        return new Paragraph({
          text: trimmed.replace(/^##\s*/, ""),
          heading: HeadingLevel.HEADING_2,
        });
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return new Paragraph({
          text: trimmed.replace(/^[-*]\s*/, ""),
          bullet: { level: 0 },
        });
      }
      return new Paragraph(trimmed);
    });

    const doc = new Document({ sections: [{ children: paragraphs }] });
    Packer.toBlob(doc).then((blob) => saveAs(blob, "boardgame-rulebook.docx"));
  };

  /** PDF 제출 */
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
              <button
                type="button"
                className="secondary-button"
                onClick={handleDownload}
              >
                다운로드
              </button>
            </div>

            <form className="submit-section" onSubmit={handleSubmitPdf}>
              <label>PDF 파일 제출</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
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
          <RulebookReport content={rulebookText} />
        )}
      </div>
    </div>
  );
}

export default RulebookGenerator;
