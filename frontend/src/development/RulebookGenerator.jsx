// src/development/RulebookGenerator.jsx
import React, { useState, useEffect } from "react";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import {
  generateRulebook,
  getContentVersions,
  saveContentVersion,
  rollbackContentVersion,
  submitComponent,
  getContentDetail,
  uploadContentFile,
} from "../api/development";
import RulebookReport from "./RulebookReport";
import "./RulebookGenerator.css";

function RulebookGenerator({ contentId, componentId }) {
  const [rulebookText, setRulebookText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 메시지 상태
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  // PDF 업로드 상태
  const [submissionFile, setSubmissionFile] = useState(null);

  const isFromList = Boolean(contentId);
  const [manualId, setManualId] = useState(contentId || "");
  const finalContentId = isFromList ? contentId : manualId;

  // 버전 관리 상태
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionNote, setVersionNote] = useState("룰북 스냅샷");

  /** 📌 초기 로드 */
  useEffect(() => {
    if (!finalContentId) return;
    (async () => {
      try {
        // 로컬 저장본
        const saved = localStorage.getItem(`rulebook_${finalContentId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setRulebookText(parsed.rulebookText || "");
        }
        // 서버 저장본
        const detail = await getContentDetail(finalContentId);
        if (detail?.contentData) {
          setRulebookText(detail.contentData);
        }
        // 버전 목록
        const versions = await getContentVersions(finalContentId);
        setVersions(versions);
        if (versions.length > 0) {
          setSelectedVersion(versions[0].versionId);
        }
      } catch (err) {
        console.error(err);
        setError("룰북 데이터 불러오기 실패");
      }
    })();
  }, [finalContentId]);

  /** 룰북 생성 */
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
      setSuccessMessage("룰북 생성 성공!");
    } catch (err) {
      console.error(err);
      setError("룰북 생성 실패");
    } finally {
      setIsLoading(false);
    }
  };

  /** 다운로드 (docx) */
  const handleDownload = () => {
    if (!rulebookText) {
      setError("다운로드할 내용이 없습니다.");
      return;
    }
    downloadAsDocx();
  };

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

  /** 📌 PDF 파일 선택 */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("PDF 파일만 업로드 가능합니다.");
      e.target.value = "";
      return;
    }
    setSubmissionFile(file);
  };

  /** 📌 PDF 업로드 */
  const handleUploadPdf = async () => {
    if (!submissionFile) return setError("업로드할 PDF 파일을 선택하세요.");
    if (!finalContentId) return setError("콘텐츠 ID가 없습니다.");

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await uploadContentFile(finalContentId, submissionFile, "manual");
      setSuccessMessage("✅ PDF 업로드 성공! 버전 노트를 입력 후 저장하세요.");
      setSubmissionFile(null);
    } catch (err) {
      console.error(err);
      setError("❌ PDF 업로드 실패");
    } finally {
      setIsLoading(false);
    }
  };

  /** 📌 업로드된 PDF 제출 */
  const handleSubmitUploaded = async () => {
    if (!componentId) return setError("컴포넌트 ID가 없습니다.");
    setIsLoading(true);

    try {
      await submitComponent(componentId);
      setSuccessMessage("🎉 룰북 제출 성공!");
    } catch {
      setError("❌ 제출 실패");
    } finally {
      setIsLoading(false);
    }
  };

  /** 버전 저장 */
  const handleSaveVersion = async () => {
    if (!versionNote.trim()) return setError("버전 노트를 입력하세요.");
    if (!finalContentId) return setError("콘텐츠 ID가 없습니다.");
    setIsLoading(true);

    try {
      await saveContentVersion({ contentId: finalContentId, note: versionNote });
      setSuccessMessage("버전 저장 성공!");
      const versions = await getContentVersions(finalContentId);
      setVersions(versions);
      if (versions.length > 0) setSelectedVersion(versions[0].versionId);
    } catch {
      setError("버전 저장 실패");
    } finally {
      setIsLoading(false);
    }
  };

  /** 롤백 */
  const handleRollbackVersion = async () => {
    if (!selectedVersion) return setError("롤백할 버전을 선택하세요.");
    setIsLoading(true);

    try {
      await rollbackContentVersion(finalContentId, selectedVersion);
      const detail = await getContentDetail(finalContentId);
      if (detail?.contentData) setRulebookText(detail.contentData);
      setSuccessMessage(`v${selectedVersion} 롤백 완료`);
    } catch {
      setError("롤백 실패");
    } finally {
      setIsLoading(false);
    }
  };

  /** 📌 렌더링 - PDF or Text 구분 */
  const renderResult = () => {
    if (!rulebookText) return null;

    // PDF URL인지 판별
    if (rulebookText.startsWith("http") && rulebookText.endsWith(".pdf")) {
      return (
        <iframe
          src={rulebookText}
          title="Rulebook PDF"
          className="pdf-viewer"
          width="100%"
          height="600px"
        />
      );
    }

    // 기본 텍스트 → 마크다운 렌더링
    return <RulebookReport content={rulebookText} />;
  };

  return (
    <div className="rulebook-page-container">
      {/* 왼쪽 폼 */}
      <div className="form-column">
        <h1>📖 룰북 생성</h1>

        {/* 콘텐츠 ID 입력 */}
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

        {/* 1. 룰북 생성 */}
        <button className="primary-button" onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? "생성 중..." : "룰북 생성하기"}
        </button>

        {/* 2. 버전 저장 */}
        <div className="version-note-form">
          <label>버전 노트</label>
          <input
            type="text"
            value={versionNote}
            onChange={(e) => setVersionNote(e.target.value)}
            placeholder="예: 룰북 v1 초안"
          />
          <button className="primary-button" onClick={handleSaveVersion} disabled={isLoading}>
            버전 저장
          </button>
        </div>

        {/* 3. 롤백 */}
        {versions.length > 0 && (
          <div className="version-select-form">
            <label>버전 선택</label>
            <select
              value={selectedVersion || ""}
              onChange={(e) => setSelectedVersion(Number(e.target.value))}
            >
              {versions.map((v) => (
                <option key={v.versionId} value={v.versionId}>
                  v{v.versionNo} - {v.note} ({v.createdAt})
                </option>
              ))}
            </select>
            <div className="button-group">
              <button className="secondary-button" onClick={handleRollbackVersion} disabled={isLoading}>
                롤백
              </button>
            </div>
          </div>
        )}

        {/* 4. 다운로드 */}
        <div className="download-controls">
          <button type="button" className="secondary-button" onClick={handleDownload}>
            다운로드
          </button>
        </div>

        {/* 5. 파일 선택 → 업로드 */}
        <div className="submit-section">
          <label>PDF 파일 업로드</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          <div className="button-group">
            <button
              type="button"
              className="secondary-button"
              onClick={handleUploadPdf}
              disabled={isLoading || !submissionFile}
            >
              업로드
            </button>
          </div>
        </div>

        {/* 6. 제출 */}
        <button
          type="button"
          className="primary-button"
          onClick={handleSubmitUploaded}
          disabled={isLoading}
        >
          제출
        </button>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>

      {/* 오른쪽 미리보기 */}
      <div className="result-column">
        {isLoading ? <div className="spinner"></div> : renderResult()}
      </div>
    </div>
  );

}

export default RulebookGenerator;
