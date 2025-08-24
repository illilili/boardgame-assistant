// src/publish/Translation.jsx
import React, { useState, useEffect } from 'react';
import { getTranslationsByContent, requestTranslations } from '../api/publish';
import { getContentDetail } from '../api/development';
import { FiChevronDown, FiFileText, FiSend, FiPlus } from 'react-icons/fi'; // 아이콘 추가
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

  const fetchContent = async (id) => {
    try {
      const data = await getContentDetail(id);
      setContent(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('원문을 불러오지 못했습니다.');
    }
  };
  
  const fetchTranslations = async (id) => {
    try {
      const data = await getTranslationsByContent(id);
      setTranslations(data.map(item => ({ ...item, feedback: '' })));
      setError('');
    } catch (err) {
      console.error(err);
      // 번역 결과가 없는 것은 에러가 아니므로 404는 무시
      if (err.response?.status !== 404) {
        setError('번역 결과 조회에 실패했습니다.');
      } else {
        setTranslations([]);
      }
    }
  };

  useEffect(() => {
    if (contentId) {
      fetchContent(contentId);
      fetchTranslations(contentId);
    } else {
      setContent(null);
      setTranslations([]);
    }
  }, [contentId]);

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
      await fetchTranslations(contentId);
      setSelectedLangs([]);
    } catch (err) {
      console.error(err);
      setError('번역 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReRequest = async (translation) => {
    try {
      setLoading(true);
      await requestTranslations({
        contentId,
        targetLanguages: [translation.targetLanguage],
        feedback: translation.feedback || '',
      });
      await fetchTranslations(contentId);
      setExpandedId(null);
    } catch (err) {
      setError(err.message || '재요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLang = (code) => {
    setSelectedLangs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };
  
  const langMap = { en: '영어', ja: '일본어', zh: '중국어', fr: '프랑스어', es: '스페인어', de: '독일어' };

  return (
    <div className={`trans-page-layout ${content?.contentType?.toLowerCase() === 'rulebook' ? 'trans-page-layout--rulebook' : ''}`}>
      
      {/* 왼쪽 패널: 원문 및 요청 */}
      <aside className="trans-panel trans-panel--left">
        <header className="trans-panel__header">
          <h2>{content?.contentType?.toLowerCase() === 'rulebook' ? '룰북 번역' : '카드 번역'}</h2>
        </header>
        
        {!contentId ? (
          <div className="trans-placeholder">
            <FiFileText />
            <p>번역할 콘텐츠를 선택해주세요.</p>
          </div>
        ) : content ? (
          <>
            <div className="trans-original-content">
              <h3>원문 (Original)</h3>
              {content.contentType?.toLowerCase() === "rulebook" ? (
                <iframe src={content.contentData} title="룰북 PDF 원문" className="trans-pdf-viewer" />
              ) : (
                <p className="trans-original-content__text">{content.contentData || '내용 없음'}</p>
              )}
            </div>

            <div className="trans-request-section">
              <label className="trans-request-section__label">번역 언어 선택</label>
              <div className="trans-lang-selector">
                {SUPPORTED_LANGS.map((lang) => (
                  <button
                    key={lang.code}
                    className={`trans-lang-selector__tag ${selectedLangs.includes(lang.code) ? 'trans-lang-selector__tag--selected' : ''}`}
                    onClick={() => toggleLang(lang.code)}
                  >
                    <FiPlus /> {lang.label}
                  </button>
                ))}
              </div>
              <button className="trans-request-button" onClick={handleTranslate} disabled={loading || selectedLangs.length === 0}>
                {loading ? '번역 중...' : `번역 요청 (${selectedLangs.length})`}
              </button>
            </div>
          </>
        ) : (
          <div className="trans-placeholder">
            <p>원문을 불러오는 중...</p>
          </div>
        )}
      </aside>

      {/* 오른쪽 패널: 번역 결과 */}
      <main className="trans-panel trans-panel--right">
        <header className="trans-panel__header">
          <h2>번역 결과</h2>
        </header>
        
        {error && <div className="trans-status-message trans-status-message--error">{error}</div>}
        
        {translations.length > 0 ? (
          <div className="trans-results-list">
            {translations.map((t) => {
                const isExpanded = expandedId === t.translationId;
                const langLabel = langMap[t.targetLanguage?.toLowerCase()] || t.targetLanguage;
                // 간단한 JSON 파싱 로직
                let parsedText = t.translatedData;
                if (typeof parsedText === 'string' && parsedText.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(parsedText);
                        parsedText = parsed.text || parsedText;
                    } catch {}
                }

                return (
                  <div key={t.translationId} className="trans-result-card">
                    <header
                      className="trans-result-card__header"
                      onClick={() => setExpandedId(isExpanded ? null : t.translationId)}
                    >
                      <span className="trans-result-card__lang">{langLabel}</span>
                      <FiChevronDown className={`trans-result-card__chevron ${isExpanded ? 'trans-result-card__chevron--expanded' : ''}`} />
                    </header>
                    <div className="trans-result-card__body">
                      <p className="trans-result-card__text">{parsedText}</p>
                    </div>
                    {isExpanded && (
                      <footer className="trans-feedback-form">
                        <textarea
                          placeholder="번역 개선을 위한 피드백을 입력하세요..."
                          value={t.feedback || ''}
                          onChange={(e) => {
                            const newVal = e.target.value;
                            setTranslations((prev) =>
                              prev.map((item) =>
                                item.translationId === t.translationId ? { ...item, feedback: newVal } : item
                              )
                            );
                          }}
                        />
                        <button onClick={() => handleReRequest(t)} disabled={loading}>
                          <FiSend /> 재요청
                        </button>
                      </footer>
                    )}
                  </div>
                );
            })}
          </div>
        ) : (
          !loading && !error && (
            <div className="trans-placeholder">
              <FiFileText />
              <p>{contentId ? '아직 번역 결과가 없습니다.' : '콘텐츠를 선택하세요.'}</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default Translation;