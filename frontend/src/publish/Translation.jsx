// Translation.jsx 다국어 번역 관리
import './Translation.css';
import React, { useEffect, useState, useContext } from 'react';
import { ProjectContext } from '../contexts/ProjectContext';

const LANGS = [
	{ code: 'en', name: '영어', flag: '🇺🇸' },
	{ code: 'ja', name: '일본어', flag: '🇯🇵' },
	{ code: 'zh', name: '중국어', flag: '🇨🇳' },
	{ code: 'de', name: '독일어', flag: '🇩🇪' },
	{ code: 'fr', name: '프랑스어', flag: '🇫🇷' },
	{ code: 'es', name: '스페인어', flag: '🇪🇸' },
];

function Translation() {
  const { projectId } = useContext(ProjectContext);
  const [contents, setContents] = useState([]);
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [translationResults, setTranslationResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedContentId, setExpandedContentId] = useState(null);
  const [pending, setPending] = useState(false);
  const [contentTranslationStatuses, setContentTranslationStatuses] = useState({});
  
  // Review modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLang, setModalLang] = useState(null);
  const [modalText, setModalText] = useState('');
  const [modalOriginalText, setModalOriginalText] = useState(''); // 원본 텍스트 추가
  const [modalFeedback, setModalFeedback] = useState('');
  const [modalTranslationId, setModalTranslationId] = useState(null);

  // 프로젝트 ID가 있을 때 콘텐츠 목록 로드
  useEffect(() => {
    if (!projectId) return;
    
    setExpandedContentId(null);
    setSelectedContentId(null);
    setTranslationResults([]);
    
    const fetchContents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 번역 후보 목록 API를 사용하여 프로젝트의 번역할 콘텐츠 목록을 가져옵니다
        const response = await fetch(`/api/translate/candidates?projectId=${projectId}`);
        if (!response.ok) {
          throw new Error(`번역 후보 목록 조회 실패: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('번역 후보 목록 API 응답:', responseData);
        
        // 번역 후보 목록이 있는지 확인하고, 없다면 빈 배열로 설정
        const contentList = responseData || [];
        console.log('번역 후보 콘텐츠 목록:', contentList);
        
        if (contentList.length === 0) {
          setContents([]);
          setError('번역할 콘텐츠가 없습니다.');
          return;
        }
        
        // 번역 후보 목록을 콘텐츠 형식으로 변환
        const allContents = contentList.map(content => {
          console.log('번역 후보 콘텐츠:', content);
          
          // 이름이 null인 경우 기본값 설정
          const contentName = content.name || `콘텐츠 ${content.contentId}`;
          
          return {
            contentId: content.contentId,
            name: contentName,
            type: content.componentType || '콘텐츠',
            description: `상태: ${content.status || '알 수 없음'}`,
            status: '번역 대기', // 기본 상태
            componentId: content.contentId // 컴포넌트 ID 저장
          };
        });
        
        console.log('변환된 콘텐츠 목록:', allContents);
        setContents(allContents);
        
        // 각 콘텐츠의 번역 상태를 자동으로 조회
        await fetchAllContentTranslationStatuses(allContents);
        
      } catch (error) {
        console.error('콘텐츠 로드 실패:', error);
        setError('번역할 콘텐츠를 불러오는 데 실패했습니다.');
        setContents([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContents();
  }, [projectId]);

  // 모든 콘텐츠의 번역 상태를 자동으로 조회하는 함수
  const fetchAllContentTranslationStatuses = async (contentList) => {
    try {
      const statusPromises = contentList.map(async (content) => {
        try {
          const response = await fetch(`/api/translate/${content.contentId}?latestOnly=true`);
          if (response.ok) {
            const results = await response.json();
            // 번역 상태를 더 정확하게 계산
            let status = '번역 대기';
            if (results && results.length > 0) {
              const hasInProgress = results.some(item => item.status === 'IN_PROGRESS');
              const hasCompleted = results.some(item => item.status === 'COMPLETED');
              
              if (hasInProgress) {
                status = '번역 중';
              } else if (hasCompleted) {
                status = '번역 완료';
              }
            }
            return { contentId: content.contentId, status, results };
          }
        } catch (error) {
          console.error(`콘텐츠 ${content.contentId} 번역 상태 조회 실패:`, error);
        }
        return { contentId: content.contentId, status: '번역 대기', results: [] };
      });

      const statusResults = await Promise.all(statusPromises);
      
      // 번역 상태들을 상태 객체에 저장
      const newStatuses = {};
      statusResults.forEach(({ contentId, status }) => {
        newStatuses[contentId] = status;
      });
      
      setContentTranslationStatuses(newStatuses);
      
      // // 첫 번째 콘텐츠를 자동으로 펼치고 선택
      // if (contentList.length > 0) {
      //   const firstContent = contentList[0];
      //   setExpandedContentId(firstContent.contentId);
      //   setSelectedContentId(firstContent.contentId);
        
      //   // 첫 번째 콘텐츠의 번역 결과도 설정
      //   const firstStatusResult = statusResults.find(r => r.contentId === firstContent.contentId);
      //   if (firstStatusResult) {
      //     setTranslationResults(firstStatusResult.results);
      //   }
      // }
      
    } catch (error) {
      console.error('전체 콘텐츠 번역 상태 조회 실패:', error);
    }
  };

  // 콘텐츠 선택 시 번역 결과 조회 및 상태 업데이트
  useEffect(() => {
    if (!selectedContentId) {
      setTranslationResults([]);
      return;
    }

    const fetchTranslationData = async () => {
      try {
        console.log('번역 결과 조회 시작:', selectedContentId);
        // 번역 결과 조회 (언어별 최신 1건)
        const resultsResponse = await fetch(`/api/translate/${selectedContentId}?latestOnly=true`);
        if (resultsResponse.ok) {
          const results = await resultsResponse.json();
          console.log('번역 결과:', results);
          setTranslationResults(results);
          
          // 현재 콘텐츠의 번역 상태 업데이트
          const status = calculateTranslationStatus(results);
          setContentTranslationStatuses(prev => ({
            ...prev,
            [selectedContentId]: status
          }));
        } else {
          console.log('번역 결과가 없습니다. 새로 시작합니다.');
          setTranslationResults([]);
        }
      } catch (error) {
        console.error('번역 데이터 로드 실패:', error);
        setTranslationResults([]);
      }
    };

    fetchTranslationData();
  }, [selectedContentId]);

  // 번역 요청 함수
  const requestTranslation = async (contentId, targetLanguages, feedback = null) => {
    try {
      console.log('번역 요청 시작:', { contentId, targetLanguages, feedback });
      setPending(true);
      const payload = {
        contentId: contentId,
        targetLanguages: targetLanguages
      };
      
      if (feedback && feedback.trim()) {
        payload.feedback = feedback.trim();
      }

      console.log('번역 요청 페이로드:', payload);

      const response = await fetch('/api/translate/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('번역 요청 실패:', response.status, errorText);
        throw new Error(`번역 요청에 실패했습니다. (${response.status})`);
      }

      const result = await response.json();
      console.log('번역 요청 성공:', result);
      
      // 번역 결과 목록 갱신
      const resultsResponse = await fetch(`/api/translate/${contentId}?latestOnly=true`);
      if (resultsResponse.ok) {
        const results = await resultsResponse.json();
        console.log('갱신된 번역 결과:', results);
        setTranslationResults(results);
        
        // 상태 업데이트
        const status = calculateTranslationStatus(results);
        setContentTranslationStatuses(prev => ({
          ...prev,
          [contentId]: status
        }));
      }

      const langNames = targetLanguages.map(code => LANGS.find(l => l.code === code)?.name || code).join(', ');
      alert(`${langNames} 번역이 요청되었습니다.`);
      
      return result;
    } catch (error) {
      console.error('번역 요청 오류:', error);
      alert(error.message || '번역 요청 중 오류가 발생했습니다.');
      throw error;
    } finally {
      setPending(false);
    }
  };

  // 번역 완료 처리 후 상태 업데이트
  const markComplete = async (translationId) => {
    try {
      const response = await fetch(`/api/translate/${translationId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('번역 완료에 실패했습니다.');
      }

      // 번역 결과 목록 갱신
      if (selectedContentId) {
        const resultsResponse = await fetch(`/api/translate/${selectedContentId}?latestOnly=true`);
        if (resultsResponse.ok) {
          const results = await resultsResponse.json();
          setTranslationResults(results);
          
          // 상태 업데이트
          const status = calculateTranslationStatus(results);
          setContentTranslationStatuses(prev => ({
            ...prev,
            [selectedContentId]: status
          }));
        }
      }

      alert('번역이 완료로 처리되었습니다.');
    } catch (error) {
      console.error('번역 완료 오류:', error);
      alert(error.message || '번역 완료 중 오류가 발생했습니다.');
    }
  };

  // 번역 완료 처리 (모달에서)
  const markCompleteFromModal = async () => {
    if (!modalTranslationId) return;
    
    try {
      await markComplete(modalTranslationId);
      closeReviewModal(); // 모달 닫기
    } catch (error) {
      console.error('모달에서 번역 완료 오류:', error);
    }
  };

  // 번역 검토 모달 열기
  const openReviewModal = async (translationItem) => {
    setIsModalOpen(true);
    setModalLang(translationItem.targetLanguage);
    setModalTranslationId(translationItem.translationId);
    
    try {
      // 번역된 텍스트 설정
      if (translationItem.translatedData) {
        const parsed = JSON.parse(translationItem.translatedData);
        setModalText(parsed?.text || String(translationItem.translatedData));
      } else {
        setModalText('');
      }
      
      // 콘텐츠 상세 조회 API를 통해 원본 내용 가져오기
      if (selectedContentId) {
        const contentResponse = await fetch(`/api/content/${selectedContentId}`);
        if (contentResponse.ok) {
          const contentDetail = await contentResponse.json();
          console.log('콘텐츠 상세 정보:', contentDetail);
          console.log('콘텐츠 상세 정보 키들:', Object.keys(contentDetail));
          console.log('콘텐츠 상세 정보 값들:', Object.entries(contentDetail).map(([key, value]) => `${key}: ${typeof value} = ${JSON.stringify(value)}`));
          
          // 원본 텍스트 설정 (실제 응답 구조에 따라 조정 필요)
          let originalText = '';
          
          // 우선순위에 따라 필드 확인
          const priorityFields = [
            'contentData','content', 'text', 'description', 'effect', 'rule', 'detail', 'name'
          ];
          
          // 우선순위 필드에서 문자열 값 찾기
          for (const field of priorityFields) {
            if (contentDetail[field]) {
              const value = contentDetail[field];
              if (typeof value === 'string' && value.trim().length > 0) {
                originalText = value.trim();
                break;
              } else if (typeof value === 'object' && value !== null) {
                // 객체인 경우 JSON.stringify로 변환
                originalText = JSON.stringify(value, null, 2);
                break;
              }
            }
          }
          
          // 우선순위 필드에서 찾지 못한 경우, 모든 문자열 필드 검색
          if (!originalText) {
            const stringFields = Object.entries(contentDetail)
              .filter(([key, value]) => typeof value === 'string' && value.trim().length > 0)
              .map(([key, value]) => `${key}: ${value.trim()}`)
              .join('\n');
            
            if (stringFields) {
              originalText = stringFields;
            }
          }
          
          // 여전히 찾지 못한 경우, 모든 필드를 표시
          if (!originalText) {
            const allFields = Object.entries(contentDetail)
              .map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                  return `${key}: ${JSON.stringify(value, null, 2)}`;
                } else {
                  return `${key}: ${value}`;
                }
              })
              .join('\n');
            
            originalText = allFields || '원본 내용을 찾을 수 없습니다.';
          }
          
          console.log('최종 추출된 원본 텍스트:', originalText);
          setModalOriginalText(originalText);
        } else {
          console.error('콘텐츠 상세 조회 실패:', contentResponse.status);
          setModalOriginalText('원본 내용을 불러올 수 없습니다.');
        }
      } else {
        setModalOriginalText('콘텐츠 ID가 없습니다.');
      }
    } catch (error) {
      console.error('모달 열기 오류:', error);
      setModalText(String(translationItem.translatedData || ''));
      setModalOriginalText('원본 내용을 불러올 수 없습니다.');
    }
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setModalLang(null);
    setModalText('');
    setModalOriginalText(''); // 원본 텍스트 초기화
    setModalFeedback('');
    setModalTranslationId(null);
  };

  // 번역 재생성 (피드백 포함)
  const regenerateTranslation = async () => {
    if (!selectedContentId || !modalLang) return;
    
    try {
      setPending(true);
      await requestTranslation(selectedContentId, [modalLang], modalFeedback);
      
      // 번역 결과 목록 갱신
      const resultsResponse = await fetch(`/api/translate/${selectedContentId}?latestOnly=true`);
      if (resultsResponse.ok) {
        const results = await resultsResponse.json();
        setTranslationResults(results);
        
        // 상태 업데이트
        const status = calculateTranslationStatus(results);
        setContentTranslationStatuses(prev => ({
          ...prev,
          [selectedContentId]: status
        }));
        
        // 모달 텍스트 갱신
        const updatedItem = results.find(item => item.targetLanguage === modalLang);
        if (updatedItem?.translatedData) {
          try {
            const parsed = JSON.parse(updatedItem.translatedData);
            setModalText(parsed?.text || '');
          } catch (error) {
            setModalText(String(updatedItem.translatedData));
          }
        }
        
        // 원본 텍스트도 다시 가져오기
        const contentResponse = await fetch(`/api/content/${selectedContentId}`);
        if (contentResponse.ok) {
          const contentDetail = await contentResponse.json();
          let originalText = '';
          
          // 우선순위에 따라 필드 확인
          const priorityFields = [
            'content', 'text', 'description', 'effect', 'rule', 'detail', 'name'
          ];
          
          // 우선순위 필드에서 문자열 값 찾기
          for (const field of priorityFields) {
            if (contentDetail[field]) {
              const value = contentDetail[field];
              if (typeof value === 'string' && value.trim().length > 0) {
                originalText = value.trim();
                break;
              } else if (typeof value === 'object' && value !== null) {
                // 객체인 경우 JSON.stringify로 변환
                originalText = JSON.stringify(value, null, 2);
                break;
              }
            }
          }
          
          // 우선순위 필드에서 찾지 못한 경우, 모든 문자열 필드 검색
          if (!originalText) {
            const stringFields = Object.entries(contentDetail)
              .filter(([key, value]) => typeof value === 'string' && value.trim().length > 0)
              .map(([key, value]) => `${key}: ${value.trim()}`)
              .join('\n');
            
            if (stringFields) {
              originalText = stringFields;
            }
          }
          
          // 여전히 찾지 못한 경우, 모든 필드를 표시
          if (!originalText) {
            const allFields = Object.entries(contentDetail)
              .map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                  return `${key}: ${JSON.stringify(value, null, 2)}`;
                } else {
                  return `${key}: ${value}`;
                }
              })
              .join('\n');
            
            originalText = allFields || '원본 내용을 찾을 수 없습니다.';
          }
          
          setModalOriginalText(originalText);
        }
      }
      
      alert('번역이 재생성되었습니다.');
    } catch (error) {
      console.error('번역 재생성 오류:', error);
      alert('번역 재생성 중 오류가 발생했습니다.');
    } finally {
      setPending(false);
    }
  };

  // 콘텐츠 번역 패널 토글
  const toggleTranslationPanel = (contentId) => {
    if (expandedContentId === contentId) {
      // 현재 열린 콘텐츠를 닫기
      setExpandedContentId(null);
      setSelectedContentId(null);
    } else {
      // 다른 콘텐츠를 열기 (기존에 열린 것이 있다면 닫기)
      setExpandedContentId(contentId);
      setSelectedContentId(contentId);
    }
  };

  // 번역 상태에 따른 클래스 반환
  const getTranslationStatusClass = (status) => {
    switch(status) {
      case 'PENDING': return 'pending';
      case 'REQUESTED': return 'requested';
      case 'IN_PROGRESS': return 'in-progress';
      case 'COMPLETED': return 'completed';
      default: return 'pending';
    }
  };

  // 번역 상태 텍스트 반환
  const getStatusText = (status) => {
    switch(status) {
      case 'PENDING': return '대기';
      case 'REQUESTED': return '요청됨';
      case 'IN_PROGRESS': return '진행중';
      case 'COMPLETED': return '완료';
      default: return '대기';
    }
  };

  // 특정 언어의 번역 상태 확인
  const getTranslationStatus = (languageCode) => {
    const translation = translationResults.find(item => item.targetLanguage === languageCode);
    return translation ? translation.status : null;
  };

  // 특정 언어의 번역 아이템 반환
  const getTranslationItem = (languageCode) => {
    return translationResults.find(item => item.targetLanguage === languageCode);
  };

  // 번역 상태 계산 함수
  const calculateTranslationStatus = (results) => {
    if (!results || results.length === 0) {
      return '번역 대기';
    }
    
    const hasCompleted = results.some(item => item.status === 'COMPLETED');
    const hasInProgress = results.some(item => item.status === 'IN_PROGRESS');
    
    if (hasCompleted) {
      return '번역 완료';
    } else if (hasInProgress) {
      return '번역 중';
    } else {
      return '번역 대기';
    }
  };

  // 콘텐츠의 전체 번역 상태 확인 (하나라도 완료면 완료)
  const getContentTranslationStatus = (contentId) => {
    // contentTranslationStatuses에서 해당 콘텐츠의 상태를 가져옴
    const currentStatus = contentTranslationStatuses[contentId];
    
    // 현재 선택된 콘텐츠이고 번역 결과가 있다면 실시간 상태 계산
    if (contentId === selectedContentId && translationResults && translationResults.length > 0) {
      const hasInProgress = translationResults.some(item => item.status === 'IN_PROGRESS');
      const hasCompleted = translationResults.some(item => item.status === 'COMPLETED');
      
      if (hasInProgress) {
        return '번역 중';
      } else if (hasCompleted) {
        return '번역 완료';
      } else {
        return '번역 대기';
      }
    }
    
    // 저장된 상태가 있으면 반환, 없으면 기본값
    return currentStatus || '번역 대기';
  };



  // 프로젝트 번역 완료 처리
  const completeProjectTranslation = async () => {
    if (!projectId) return;
    
    try {
      setPending(true);
      
      // 현재 프로젝트의 모든 번역 결과에서 완료되지 않은 항목들을 완료 처리
      const incompleteTranslations = translationResults.filter(item => item.status !== 'COMPLETED');
      
      if (incompleteTranslations.length === 0) {
        alert('이미 모든 번역이 완료되었습니다.');
        return;
      }
      
      // 모든 미완료 번역을 완료 처리
      const completionPromises = incompleteTranslations.map(translation => 
        fetch(`/api/translate/${translation.translationId}/complete`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        })
      );
      
      await Promise.all(completionPromises);
      
      // 번역 결과 목록 갱신
      if (selectedContentId) {
        const resultsResponse = await fetch(`/api/translate/${selectedContentId}?latestOnly=true`);
        if (resultsResponse.ok) {
          const results = await resultsResponse.json();
          setTranslationResults(results);
        }
      }
      
      alert('프로젝트 번역이 완료로 처리되었습니다.');
    } catch (error) {
      console.error('프로젝트 번역 완료 오류:', error);
      alert('프로젝트 번역 완료 중 오류가 발생했습니다.');
    } finally {
      setPending(false);
    }
  };

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  // 프로젝트 ID가 없으면 메시지 표시
  if (!projectId) {
    return (
      <div className="component-placeholder">
        <h2>[번역] 번역 관리</h2>
        <p>프로젝트를 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="component-placeholder">
      <h2>[번역] 번역 관리</h2>
      <p>현재 프로젝트의 승인된 콘텐츠 중 번역이 필요한 항목들을 확인하고 번역합니다.</p> 
      


      <div className="dev-list-container">
        <div className="dev-list-header">
          <span className="header-category">타입</span>
          <span className="header-task">번역 콘텐츠</span>
          <span className="header-status">상태</span>
        </div>
        
        {isLoading ? <div className="message-container">로딩 중...</div> : 
         error ? <div className="message-container error">{error}</div> :
         contents.length > 0 ? (
          <ul className="dev-list">
            {contents.map(content => {
              const isExpanded = expandedContentId === content.contentId;
              const translationStatus = getContentTranslationStatus(content.contentId);
              
              return (
                <React.Fragment key={content.contentId}>
                  <li
                    className="dev-list-item clickable"
                    onClick={() => toggleTranslationPanel(content.contentId)}
                  >
                    <span className="item-category">{content.type}</span>
                    <div className="item-task-group">
                      <span className="item-task-name">{content.name}</span>
                      {/* <span className="item-related-plan">
                        {content.description && `${content.description}`}
                      </span> */}
                      {/* 펼쳐진 상태일 때 상세 정보 표시 */}
                      {isExpanded && (
                        <div className="item-details-wrapper">
                          <p className="item-details"><strong>설명:</strong> {content.description || '설명 없음'}</p>
                        </div>
                      )}
                    </div>
                    <span className="item-status">
                      <span className={`status-badge ${
                        translationStatus === '번역 완료' ? 'status-completed' :
                        translationStatus === '번역 중' ? 'status-in-progress' :
                        'status-waiting'
                      }`}>
                        {translationStatus}
                      </span>
                    </span>
                  </li>
                  
                  {/* 펼쳐진 상태일 때 번역 관리 패널 표시 */}
                  {isExpanded && (
                    <div className="sub-task-container">
                      <div className="translation-management-panel">
                        <h4>언어별 번역 관리</h4>
                        <div className="language-grid">
                          {LANGS.map(lang => {
                            const translationItem = getTranslationItem(lang.code);
                            const status = translationItem ? translationItem.status : null;
                            
                            return (
                              <div key={lang.code} className="language-card">
                                <div className="language-header">
                                  <span className="language-flag">{lang.flag}</span>
                                  <span className="language-name">{lang.name}</span>
                                </div>
                                <div className="translation-actions">
                                  {translationItem ? (
                                    <div className="translation-status">
                                      <span className={`translation-badge ${getTranslationStatusClass(status)}`}>
                                        {getStatusText(status)}
                                      </span>
                                      <div className="translation-action-buttons">
                                        {status === 'COMPLETED' ? (
                                          <button 
                                            className="btn-review"
                                            onClick={() => openReviewModal(translationItem)}
                                          >
                                            검토
                                          </button>
                                        ) : status === 'IN_PROGRESS' ? (
                                          <button 
                                            className="btn-review"
                                            onClick={() => openReviewModal(translationItem)}
                                          >
                                            미리보기
                                          </button>
                                        ) : null}
                                      </div>
                                    </div>
                                  ) : (
                                    <button 
                                      className="btn-request-translation"
                                      onClick={() => requestTranslation(content.contentId, [lang.code])}
                                      disabled={pending}
                                    >
                                      번역 요청
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </ul>
        ) : (
          <div className="message-container">표시할 번역 콘텐츠가 없습니다.</div>
        )}
      </div>
             {/* 번역 검토 모달 */}
       {isModalOpen && (
         <div className="translation-modal-backdrop">
           <div className="translation-modal-content">
             <div className="translation-modal-header">
               <h3>번역 검토 · {LANGS.find(l => l.code === modalLang)?.name || '언어 정보 없음'}</h3>
             </div>
             <div className="translation-modal-body">
               <div className="text-comparison">
                 <div className="original-text-section">
                   <h4>원본 내용</h4>
                   <pre className="original-preview" style={{maxHeight:'200px'}}>
                     {modalOriginalText || '원본 내용이 없습니다.'}
                   </pre>
                 </div>
                 <div className="translated-text-section">
                   <h4>번역 내용</h4>
                   <pre className="translated-preview" style={{maxHeight:'200px'}}>
                     {modalText || '번역 결과가 아직 없습니다.'}
                   </pre>
                 </div>
               </div>
               <div className="translation-modal-actions">
                 <textarea
                   className="feedback-input"
                   placeholder="번역 수정 내용을 입력해 주세요 (재생성 시 사용됩니다)"
                   value={modalFeedback}
                   onChange={(e) => setModalFeedback(e.target.value)}
                   rows={5}
                 />
                 <button 
                   className="regen-btn" 
                   disabled={pending} 
                   onClick={regenerateTranslation}
                 >
                   {pending ? '재생성 중...' : '재생성'}
                 </button>
               </div>
             </div>
             <div className="translation-modal-footer">
               <button className="translation-close-btn" onClick={closeReviewModal}>닫기</button>
               {modalTranslationId && (
                 <button 
                   className="translation-btn-edit-modal" 
                   onClick={markCompleteFromModal}
                   disabled={pending}
                 >
                   {(() => {
                     // 현재 번역 아이템의 상태 확인
                     const currentTranslation = translationResults.find(
                       item => item.translationId === modalTranslationId
                     );
                     return currentTranslation?.status === 'COMPLETED' ? '수정' : '완료';
                   })()}
                 </button>
               )}
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

export default Translation;
