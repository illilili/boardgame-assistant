import React, { useState, useEffect } from 'react';
import {
  getCardPreview,
  generateCardText,
  generateCardImage,
  saveContentVersion,
  getContentVersions,
  rollbackContentVersion,
  getContentDetail,
  completeContent,
  submitComponent
} from '../api/development';
import './ComponentGenerator.css';
import Select from 'react-select';

function ComponentGenerator({ textContentId, imageContentId, componentId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [cardData, setCardData] = useState({ name: '', effect: '', description: '' });
  const [previewInfo, setPreviewInfo] = useState({ theme: '', storyline: '' });
  const [generatedResult, setGeneratedResult] = useState({ text: null, imageUrl: null });

  // 버전 관리
  const [textVersions, setTextVersions] = useState([]);
  const [imageVersions, setImageVersions] = useState([]);
  const [selectedTextVersion, setSelectedTextVersion] = useState(null);
  const [selectedImageVersion, setSelectedImageVersion] = useState(null);
  const [versionNote, setVersionNote] = useState('카드 스냅샷');

  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  // 초기 프리뷰 + 로컬스토리지 불러오기
  useEffect(() => {
    const fetchData = async () => {
      const targetId = textContentId || imageContentId;
      if (!targetId) return;

      setIsLoading(true);
      setLoadingMessage('카드 정보 불러오는 중...');
      try {
        const preview = await getCardPreview(targetId);
        if (preview) {
          setCardData({
            name: preview.name || '',
            effect: preview.effect || '',
            description: preview.description || preview.imageDescription || ''
          });
          setPreviewInfo({
            theme: preview.theme || '',
            storyline: preview.storyline || ''
          });
        }

        // 로컬스토리지 복원
        let restored = {};
        if (textContentId) {
          const savedText = localStorage.getItem(`card_${textContentId}`);
          if (savedText) restored = { ...JSON.parse(savedText) };
        }
        if (imageContentId) {
          const savedImage = localStorage.getItem(`card_${imageContentId}`);
          if (savedImage) restored = { ...restored, ...JSON.parse(savedImage) };
        }
        if (Object.keys(restored).length > 0) setGeneratedResult(restored);

        // 버전 목록 불러오기
        if (textContentId) {
          const list = await getContentVersions(textContentId);
          setTextVersions(list);
          if (list.length > 0) setSelectedTextVersion(list[0].versionId);
        }
        if (imageContentId) {
          const list = await getContentVersions(imageContentId);
          setImageVersions(list);
          if (list.length > 0) setSelectedImageVersion(list[0].versionId);
        }
      } catch (err) {
        console.error(err);
        setError('미리보기 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    };

    fetchData();
  }, [textContentId, imageContentId]);

  // 결과 로컬스토리지 저장
  useEffect(() => {
    if (textContentId && generatedResult.text) {
      localStorage.setItem(
        `card_${textContentId}`,
        JSON.stringify({ text: generatedResult.text })
      );
    }
    if (imageContentId && generatedResult.imageUrl) {
      localStorage.setItem(
        `card_${imageContentId}`,
        JSON.stringify({ imageUrl: generatedResult.imageUrl })
      );
    }
  }, [generatedResult, textContentId, imageContentId]);

  // 텍스트 생성
  const handleGenerateText = async () => {
    if (!textContentId) return;
    setIsLoading(true);
    setLoadingMessage('카드 텍스트 생성 중...');
    setError('');
    try {
      const requestData = { contentId: textContentId, ...cardData };
      const response = await generateCardText(requestData);
      const resultText = response.generated_texts[0].text;
      setGeneratedResult((prev) => ({ ...prev, text: resultText }));
    } catch (err) {
      setError('카드 텍스트 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // 이미지 생성
  const handleGenerateImage = async () => {
    if (!imageContentId) return;
    setIsLoading(true);
    setLoadingMessage('카드 이미지 생성 중...');
    setError('');
    try {
      const requestData = { contentId: imageContentId, ...cardData };
      const response = await generateCardImage(requestData);
      const resultImage = response.generated_images[0].imageUrl;
      setGeneratedResult((prev) => ({ ...prev, imageUrl: resultImage }));
    } catch (err) {
      setError('카드 이미지 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // 버전 저장
  const handleSaveVersion = async (targetId) => {
    if (!versionNote.trim()) return setError('❌ 버전 노트를 입력하세요.');
    if (!targetId) return setError('❌ 콘텐츠 ID가 없습니다.');

    try {
      await saveContentVersion({ contentId: targetId, note: versionNote });
      setVersionNote('카드 스냅샷');
      setMessage('✅ 버전이 저장되었습니다.');

      if (targetId === textContentId) {
        const list = await getContentVersions(textContentId);
        setTextVersions(list);
        setSelectedTextVersion({ value: list[0].versionId, label: `v${list[0].versionNo} - ${list[0].note} (${list[0].createdAt})` });
      } else {
        const list = await getContentVersions(imageContentId);
        setImageVersions(list);
        setSelectedImageVersion({ value: list[0].versionId, label: `v${list[0].versionNo} - ${list[0].note} (${list[0].createdAt})` });
      }
    } catch (err) {
      console.error(err);
      setError('❌ 버전 저장 실패');
    }
  }

  // 롤백
  const handleRollbackVersion = async (targetId, versionId) => {
    if (!versionId) return setError('❌ 롤백할 버전을 선택하세요.');
    if (!targetId) return setError('❌ 콘텐츠 ID가 없습니다.');

    try {
      await rollbackContentVersion(targetId, versionId);
      const detail = await getContentDetail(targetId);

      if (targetId === textContentId) {
        setGeneratedResult((prev) => ({ ...prev, text: detail.contentData }));
      } else {
        setGeneratedResult((prev) => ({ ...prev, imageUrl: detail.contentData }));
      }

      setMessage('↩️ 이전 버전으로 롤백되었습니다.');
    } catch (err) {
      console.error(err);
      setError('❌ 롤백 실패');
    }
  };
  // 완료
  const handleComplete = async (targetId) => {
    if (!targetId) return setMessage('❌ 콘텐츠 ID가 없습니다.');
    setIsLoading(true);
    setMessage('');
    try {
      await completeContent(targetId);
      setMessage('✅ 완료 처리되었습니다.');
    } catch (err) {
      console.error(err);
      setMessage('❌ 완료 처리 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 제출
  const handleSubmit = async (componentId) => {
    if (!componentId) return setMessage('❌ 컴포넌트 ID가 없습니다.');
    setIsLoading(true);
    setMessage('');
    try {
      await submitComponent(componentId);
      setMessage('🎉 제출 완료!');
    } catch (err) {
      console.error(err);
      setMessage('❌ 제출 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 초기화
  const handleReset = () => {
    setGeneratedResult({ text: null, imageUrl: null });
    setError('');
    if (textContentId) localStorage.removeItem(`card_${textContentId}`);
    if (imageContentId) localStorage.removeItem(`card_${imageContentId}`);
  };

  const hasResult = generatedResult.text || generatedResult.imageUrl;

  return (
    <div className="card-generator-container">
      <h2 className="card-generator-title">카드 생성</h2>
      <p className="card-generator-desc">
        카드의 이름, 효과, 설명을 입력하고 텍스트와 이미지를 생성합니다.
      </p>

      {isLoading && (
        <div className="status-container">
          <div className="loader"></div>
          <h3>{loadingMessage}</h3>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {!isLoading && (
        <>
          <div className={`card-gen-content ${hasResult ? "double" : "single"}`}>
            {/* 왼쪽: 입력 폼 */}
            <div className="card-gen-form">
              <div className="concept-info">
                <h3>기본 컨셉 정보</h3>
                <p>
                  <strong>테마:</strong> {previewInfo.theme}
                </p>
                <p>
                  <strong>스토리라인:</strong> {previewInfo.storyline}
                </p>
              </div>

              <div className="form-group">
                <label>카드 이름</label>
                <input
                  type="text"
                  name="name"
                  value={cardData.name}
                  onChange={handleInputChange}
                  placeholder="카드 이름 입력"
                />
              </div>
              <div className="form-group">
                <label>카드 효과</label>
                <textarea
                  name="effect"
                  value={cardData.effect}
                  onChange={handleInputChange}
                  placeholder="카드 효과 입력"
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>카드 설명 (이미지 생성 시 참고)</label>
                <textarea
                  name="description"
                  value={cardData.description}
                  onChange={handleInputChange}
                  placeholder="카드에 대한 부가 설명이나 아트 컨셉 입력"
                  rows={4}
                />
              </div>

              {!hasResult && (
                <div className="generate-buttons-container">
                  <button
                    onClick={handleGenerateText}
                    className="generate-button text-btn"
                    disabled={!textContentId}
                  >
                    텍스트 생성하기
                  </button>
                  <button
                    onClick={handleGenerateImage}
                    className="generate-button image-btn"
                    disabled={!imageContentId}
                  >
                    이미지 생성하기
                  </button>
                </div>
              )}
            </div>

            {/* 오른쪽: 결과 미리보기 */}
            {hasResult && (
              <div className="card-result-container">
                <h3>🎉 생성 완료!</h3>
                <div className="generated-card-preview">
                  {generatedResult.imageUrl ? (
                    <img
                      src={generatedResult.imageUrl}
                      alt="Generated Card"
                      className="card-image"
                    />
                  ) : (
                    <div className="image-placeholder">이미지를 생성해 주세요.</div>
                  )}
                  {generatedResult.text ? (
                    <div className="card-text-area">
                      <p>{generatedResult.text}</p>
                    </div>
                  ) : (
                    <div className="text-placeholder">텍스트를 생성해 주세요.</div>
                  )}
                </div>

                <div className="result-actions">
                  <button onClick={handleReset} className="reset-button-bottom">
                    다시 생성
                  </button>
                  {!generatedResult.text && textContentId && (
                    <button
                      onClick={handleGenerateText}
                      className="generate-button text-btn"
                    >
                      텍스트 생성
                    </button>
                  )}
                  {!generatedResult.imageUrl && imageContentId && (
                    <button
                      onClick={handleGenerateImage}
                      className="generate-button image-btn"
                    >
                      이미지 생성
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 버전 관리 박스 */}
          {(hasResult || textVersions.length > 0 || imageVersions.length > 0) && (
            <div className="content-version-manager">

              {/* 텍스트 + 이미지 버전 블록 가로 배치 */}
              <div className="version-block-row">
                {/* 텍스트 버전 */}
                {textContentId && (
                  <div className="version-block">
                    <label>텍스트 버전 선택</label>
                    {textVersions.length > 0 ? (
                      <Select
                        className="version-select"
                        value={selectedTextVersion}
                        onChange={(selected) => setSelectedTextVersion(selected)}
                        options={textVersions.map(v => ({
                          value: v.versionId,
                          label: `v${v.versionNo} - ${v.note} (${v.createdAt})`
                        }))}
                        placeholder="버전을 선택하세요"
                      />
                    ) : (
                      <p>저장된 텍스트 버전이 없습니다.</p>
                    )}
                    <div className="version-buttons center">
                      <button
                        className="save"
                        onClick={() => handleSaveVersion(textContentId)}
                      >
                        버전 저장
                      </button>
                      {selectedTextVersion && (
                        <button
                          className="rollback"
                          onClick={() =>
                            handleRollbackVersion(textContentId, selectedTextVersion.value)
                          }
                        >
                          롤백
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 이미지 버전 */}
                {imageContentId && (
                  <div className="version-block">
                    <label>이미지 버전 선택</label>
                    {imageVersions.length > 0 ? (
                      <Select
                        className="version-select"
                        value={selectedImageVersion}
                        onChange={(selected) => setSelectedImageVersion(selected)}
                        options={imageVersions.map(v => ({
                          value: v.versionId,
                          label: `v${v.versionNo} - ${v.note} (${v.createdAt})`
                        }))}
                        placeholder="버전을 선택하세요"
                      />
                    ) : (
                      <p>저장된 이미지 버전이 없습니다.</p>
                    )}
                    <div className="version-buttons center">
                      <button
                        className="save"
                        onClick={() => handleSaveVersion(imageContentId)}
                      >
                        버전 저장
                      </button>
                      {selectedImageVersion && (
                        <button
                          className="rollback"
                          onClick={() =>
                            handleRollbackVersion(imageContentId, selectedImageVersion.value)
                          }
                        >
                          롤백
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 버전 메모 */}
              <div className="version-note">
                <label>버전 메모:</label>
                <input
                  type="text"
                  value={versionNote}
                  onChange={(e) => setVersionNote(e.target.value)}
                  placeholder="예: 카드 스냅샷, 이미지 교체 전 상태 등"
                />
              </div>

              {/* 완료/제출 */}
              <div className="submit-complete-section">
                {textContentId && (
                  <button onClick={() => handleComplete(textContentId)}>텍스트 완료(확정)</button>
                )}
                {imageContentId && (
                  <button onClick={() => handleComplete(imageContentId)}>이미지 완료(확정)</button>
                )}
                {componentId && (
                  <button onClick={() => handleSubmit(componentId)}>제출</button>
                )}
              </div>

              {message && <p className="upload-message">{message}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ComponentGenerator;
