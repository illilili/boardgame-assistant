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
import './ComponentGenerator.css';   // 레이아웃, 공통 폼 스타일
import './ModelGenerator.css';       // 버전관리 UI 공통
import './RulebookGenerator.css';    // 룰북 전용
import Select from "react-select";

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
      setSuccessMessage("✅ PDF 업로드 성공!");
      setSubmissionFile(null);

      // ✅ 업로드 후 최신 데이터 다시 로딩
      const detail = await getContentDetail(finalContentId);
      if (detail?.contentData) {
        setRulebookText(detail.contentData);
      }
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
    <div className="generator-layout">
      {/* ------------------- 왼쪽: 입력 및 버전관리 ------------------- */}
      <div className="generator-form-section">
        <div className="form-section-header">
          <h2> 룰북 생성</h2>
          <p>룰북 초안을 자동 생성하고 완성된 룰북 PDF를 업로드하세요.</p>
        </div>

        {/* 콘텐츠 ID */}
        {!isFromList && (
          <div className="form-group">
            <label>콘텐츠 ID</label>
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="콘텐츠 ID 입력"
            />
          </div>
        )}

        {/* 룰북 생성 + DOCX 다운로드 */}
        <div className="rulebook-form-group">
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? "생성 중..." : "룰북 초안 생성하기"}
          </button>
          <button
            type="button"
            className="download-btn"
            onClick={handleDownload}
          >
            DOCX 다운로드
          </button>
        </div>

        {/* 버전관리 + PDF 업로드 + 제출 */}
        {rulebookText && (
          <>
            {/* 버전관리 */}
            <div className="model-version-manager">
              <h4>버전 관리</h4>

              {/* 버전 메모 + 저장 */}
              <div className="model-version-note">
                <label>버전 메모:</label>
                <input
                  type="text"
                  value={versionNote}
                  onChange={(e) => setVersionNote(e.target.value)}
                  placeholder="예: 룰북 v1 초안"
                />
                <button
                  className="save"
                  onClick={handleSaveVersion}
                  disabled={isLoading}
                >
                  버전 저장
                </button>
              </div>

              {/* 버전 선택 + 롤백 */}
              <div className="model-version-select-row">
                {versions.length > 0 ? (
                  <Select
                    className="version-select"
                    classNamePrefix="react-select"
                    value={
                      versions
                        .map((v) => ({
                          value: v.versionId,
                          label: `v${v.versionNo} - ${v.note} (${new Date(
                            v.createdAt
                          ).toLocaleString()})`,
                        }))
                        .find((opt) => opt.value === selectedVersion) || null
                    }
                    onChange={(selected) => setSelectedVersion(selected.value)}
                    options={versions.map((v) => ({
                      value: v.versionId,
                      label: `v${v.versionNo} - ${v.note} (${new Date(
                        v.createdAt
                      ).toLocaleString()})`,
                    }))}
                    placeholder="버전 선택"
                  />
                ) : (
                  <Select
                    className="version-select"
                    classNamePrefix="react-select"
                    isDisabled
                    placeholder="저장된 버전 없음"
                  />
                )}

                {selectedVersion && (
                  <button
                    className="rollback"
                    onClick={handleRollbackVersion}
                    disabled={isLoading}
                  >
                    롤백
                  </button>
                )}
              </div>
            </div> {/* ✅ div 닫음 */}

            {/* PDF 업로드 */}
            <div className="pdf-upload-section">
              <h4>PDF 파일 업로드</h4>
              <div className="file-upload-group">
                <div className="file-input-row">
                  <div className="file-input-box">
                    <input
                      type="file"
                      id="fileInput"
                      onChange={handleFileChange}
                      className="file-upload-input"
                      accept="application/pdf"
                    />
                    <label htmlFor="fileInput" className="file-select-btn">
                      파일 선택
                    </label>
                    <span className="file-name">
                      {submissionFile
                        ? submissionFile.name
                        : "파일을 선택해 주세요"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="file-upload-button"
                    onClick={handleUploadPdf}
                    disabled={isLoading || !submissionFile}
                  >
                    업로드
                  </button>
                </div>
              </div>
            </div>

            {/* 제출 */}
            <div className="submit-complete-section">
              <button
                className="primary-button"
                onClick={handleSubmitUploaded}
                disabled={isLoading}
              >
                제출
              </button>
            </div>
          </>
        )}

        {error && <p className="error-message">{error}</p>}
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}
      </div>

      {/* ------------------- 오른쪽: 결과 뷰어 ------------------- */}
      <div
        className={`rulebook-preview ${rulebookText ? "filled" : "empty"
          }`}
      >
        {isLoading ? (
          <div className="status-container">
            <div className="loader"></div>
            <h3>처리 중...</h3>
          </div>
        ) : rulebookText ? (
          renderResult()
        ) : (
          <div className="placeholder-message">
            <p>
              룰북 생성을 눌러주세요. 자동 생성된 초안 또는 업로드된 PDF가
              이곳에 표시됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );


}
export default RulebookGenerator;
