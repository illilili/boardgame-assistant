import React, { useState } from 'react';
import { createProject as apiCreateProject } from '../api/auth.js';
import './ProjectCreationPage.css'; // 새로 만들 CSS 파일을 임포트합니다.

// 아이콘 컴포넌트
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="pcp-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="pcp-result-icon success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ExclamationCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="pcp-result-icon error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const LoadingSpinner = () => (
     <svg className="pcp-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const ProjectCreationPage = () => {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!projectName.trim()) {
            setError({ message: '프로젝트 제목을 입력해주세요.' });
            return;
        }

        setIsLoading(true);
        setApiResponse(null);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken'); 
            if (!token) {
                throw new Error('로그인이 필요합니다. 인증 토큰을 찾을 수 없습니다.');
            }
            
            const data = await apiCreateProject({
                name: projectName,
                description: description,
            });
            
            setApiResponse(data);

        } catch (err) {
            setError({ message: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setProjectName('');
        setDescription('');
        setApiResponse(null);
        setError(null);
    };

    return (
        <div className="pcp-container">
            <div className="pcp-card">
                <div className="pcp-header">
                    <h1 className="pcp-title">새로운 보드게임 프로젝트</h1>
                    <p className="pcp-subtitle">세상을 놀라게 할 당신의 아이디어를 현실로 만들어보세요.</p>
                </div>

                {apiResponse && (
                    <div className="pcp-result-box success">
                        <CheckCircleIcon />
                        <h3 className="pcp-result-title">프로젝트 생성 완료!</h3>
                        <p className="pcp-result-message">{apiResponse.message}</p>
                        <div className="pcp-result-details">
                            <p><strong>프로젝트 ID:</strong> {apiResponse.projectId}</p>
                            <p><strong>프로젝트 이름:</strong> {apiResponse.projectName}</p>
                            <p><strong>기획자:</strong> {apiResponse.creatorName}</p>
                        </div>
                        <button onClick={handleReset} className="pcp-button primary">
                            새 프로젝트 생성하기
                        </button>
                    </div>
                )}

                {error && (
                     <div className="pcp-result-box error">
                        <ExclamationCircleIcon />
                        <h3 className="pcp-result-title">오류 발생</h3>
                        <p className="pcp-result-message">{error.message}</p>
                        <button onClick={handleReset} className="pcp-button error">
                            다시 시도하기
                        </button>
                    </div>
                )}

                {!apiResponse && !error && (
                    <form onSubmit={handleSubmit} className="pcp-form">
                        <div className="pcp-input-group">
                            <label htmlFor="projectName" className="pcp-label">
                                프로젝트 제목
                            </label>
                            <input
                                type="text"
                                id="projectName"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="예: 차원의 균열"
                                className="pcp-input"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="pcp-input-group">
                            <label htmlFor="description" className="pcp-label">
                                프로젝트 설명 (선택 사항)
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                placeholder="이 프로젝트에 대한 간단한 설명을 입력하세요."
                                className="pcp-textarea"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="pcp-button primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinner />
                                    생성 중...
                                </>
                            ) : (
                                <>
                                    <PlusIcon />
                                    프로젝트 생성
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProjectCreationPage;
