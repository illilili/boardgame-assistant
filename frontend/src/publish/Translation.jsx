// src/publish/Translation.jsx
import React, { useState, useEffect } from 'react';
import { getTranslationsByContent, requestTranslations } from '../api/publish';
import { getContentDetail } from '../api/development';
import './Translation.css';

const SUPPORTED_LANGS = [
  { code: "en", label: "영어" },
  { code: "ja", label: "일본어" },
  { code: "zh", label: "중국어" },
  { code: "fr", label: "프랑스어" },
  { code: "es", label: "스페인어" },
];

function Translation({ contentId }) {
  const [content, setContent] = useState(null);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // ✅ 원문 불러오기
  useEffect(() => {
    if (!contentId) {
      setContent(null);
      return;
    }
    const fetchContent = async () => {
      try {
        const data = await getContentDetail(contentId);
        setContent(data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('원문을 불러오지 못했습니다.');
      }
    };
    fetchContent();
  }, [contentId]);

  // ✅ 번역 결과 불러오기
  const fetchTranslations = async () => {
    try {
      const data = await getTranslationsByContent(contentId);
      setTranslations(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('번역 결과 조회 실패');
    }
  };

  // ✅ 번역 요청
  const handleTranslate = async () => {
    if (selectedLangs.length === 0 || !contentId) {
      setError("번역할 언어를 선택하세요.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      await requestTranslations({
        contentId: Number(contentId),
        targetLanguages: selectedLangs,
      });
      await fetchTranslations();
    } catch (err) {
      console.error(err);
      setError('번역 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 재요청 핸들러
  const handleReRequest = async (translation) => {
    try {
      setLoading(true);
      await requestTranslations({
        contentId,
        targetLanguages: [translation.targetLanguage],
        feedback: translation.feedback || '',
      });

      // ✅ 다시 목록 새로고침
      const data = await getTranslationsByContent(contentId, true);

      // ✅ feedback 기본값 강제 삽입
      setTranslations(
        data.map((item) => ({
          ...item,
          feedback: '', // 🔑 항상 빈 상태로 초기화
        }))
      );

      setExpandedId(null); // 폼 닫기
    } catch (err) {
      setError(err.message || '재요청 실패');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (contentId) {
      fetchTranslations();
    } else {
      setTranslations([]);
    }
  }, [contentId]);

  const toggleLang = (code) => {
    setSelectedLangs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className={`trans__container ${content?.contentType?.toLowerCase() === 'rulebook' ? 'rulebook-layout' : ''}`}>

      {/* ---------------- 왼쪽: 원문 ---------------- */}
      <div className="trans__left-panel">
        <h2>
          {content?.contentType?.toLowerCase() === 'rulebook'
            ? '룰북 번역하기'
            : '카드 번역하기'}
        </h2>
        {!contentId ? (
          <div className="placeholder-message">
            <h3>번역 대기 목록에서 번역할 콘텐츠를 먼저 선택해주세요.</h3>
          </div>
        ) : content ? (
          <>
            <div className="trans__original">
              <h3>원문</h3>
              {content.contentType?.toLowerCase() === "rulebook" ? (
                // ✅ 룰북은 PDF 뷰어로 표시
                <iframe
                  src={content.contentData}  // 백엔드에서 주는 pdf 경로
                  title="룰북 PDF 원문"
                  className="trans__pdf-viewer"
                />
              ) : (
                // ✅ 그 외에는 텍스트 표시
                <p>{content.contentData || '내용 없음'}</p>
              )}
            </div>

            <div className="trans__options">
              <label>번역 언어 선택</label>
              <div className="trans__checkbox-group">
                {SUPPORTED_LANGS.map((lang) => (
                  <label key={lang.code} className="trans__checkbox">
                    <input
                      type="checkbox"
                      checked={selectedLangs.includes(lang.code)}
                      onChange={() => toggleLang(lang.code)}
                    />
                    <span>{lang.label}</span>
                  </label>
                ))}
              </div>
              <button onClick={handleTranslate} disabled={loading}>
                {loading ? '번역 중...' : '번역 요청'}
              </button>
            </div>
          </>
        ) : (
          <p>원문을 불러오는 중...</p>
        )}
      </div>

      {/* ---------------- 오른쪽: 번역 결과 ---------------- */}
      <div className="trans__right-panel">
        <h2>번역 결과</h2>
        <p className="trans__subtitle"> 번역 결과를 클릭하면 재요청이 가능합니다.</p>
        {error && <div className="trans__error">{error}</div>}

        {loading && <p>⏳ 번역 요청 중입니다...</p>}

        {!loading && translations.length > 0 ? (
          <div className="trans__results">
            {translations.map((t) => {
              let parsedText = '';
              try {
                const parsed = JSON.parse(t.translatedData);
                parsedText = parsed.text || t.translatedData;
              } catch {
                parsedText = t.translatedData;
              }
              parsedText = parsedText
                .replace(/=+ 번역 시작 =+/g, '')
                .replace(/=+ 번역 끝 =+/g, '')
                .replace(/=+ 翻译开始 =+/g, '')
                .replace(/=+ 翻译结束 =+/g, '')
                .replace(/=+ 输出开始 =+/g, '')
                .replace(/=+ 输出结束 =+/g, '')
                .replace(/=+ SOURCE BEGIN =+/g, '')
                .replace(/=+ SOURCE END =+/g, '')
                .trim();

              const langMap = { en: '영어', ja: '일본어', zh: '중국어', fr: '프랑스어', es: '스페인어', de: '독일어' };
              const langLabel = langMap[t.targetLanguage?.toLowerCase()] || t.targetLanguage;

              return (
                <div key={t.translationId} className="trans__result-card">
                  {/* 카드 헤더 + 본문 */}
                  <div
                    className="trans__result-main clickable"
                    onClick={() =>
                      setExpandedId(expandedId === t.translationId ? null : t.translationId)
                    }
                  >
                    <span className="trans__lang">{langLabel}</span>
                    <p className="trans__text">{parsedText}</p>
                  </div>

                  {/* ✅ 클릭 시 확장되는 재요청 폼 */}
                  {expandedId === t.translationId && (
                    <div className="trans__feedback-box">
                      <textarea
                        placeholder="피드백을 입력하세요 (예: 문장이 어색해요)"
                        value={t.feedback || ''}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setTranslations((prev) =>
                            prev.map((item) =>
                              item.translationId === t.translationId
                                ? { ...item, feedback: newVal }
                                : item
                            )
                          );
                        }}
                      />
                      <button onClick={() => handleReRequest(t)} disabled={loading}>
                        재요청
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          !loading && !error && translations.length === 0 && (
            <div className="placeholder-message">
              <h3>언어를 선택하고 번역요청을 해주세요.</h3>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Translation;
