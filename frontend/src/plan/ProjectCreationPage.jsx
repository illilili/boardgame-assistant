import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../api/project';

// 아이콘 컴포넌트
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> );
const ExclamationCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );

const ProjectCreationPage = () => {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!projectName.trim()) {
            setError({ message: '프로젝트 제목을 입력해주세요.' });
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await createProject({
                name: projectName,
                description: description,
            });
            
            alert(data.message);
            navigate(`/projects/${data.projectId}`);

        } catch (err) {
            setError({ message: err.message || '프로젝트 생성에 실패했습니다. 다시 시도해주세요.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="creation-page__background">
            <div className="creation-page__container">
                <div className="creation-page__card">
                    <div className="creation-page__content">
                        <h1 className="creation-page__title">새로운 보드게임 프로젝트</h1>
                        <p className="creation-page__subtitle">세상을 놀라게 할 당신의 아이디어를 현실로 만들어보세요.</p>

                        {error && (
                            <div className="creation-page__error-box">
                                <ExclamationCircleIcon />
                                <h3 className="creation-page__error-title">오류 발생</h3>
                                <p>{error.message}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="creation-page__form-group">
                                <label htmlFor="projectName" className="creation-page__label">
                                    프로젝트 제목
                                </label>
                                <input
                                    type="text"
                                    id="projectName"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="예: 차원의 균열"
                                    className="creation-page__input"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="creation-page__form-group">
                                <label htmlFor="description" className="creation-page__label">
                                    프로젝트 설명 (선택 사항)
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="4"
                                    placeholder="이 프로젝트에 대한 간단한 설명을 입력하세요."
                                    className="creation-page__textarea"
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                className="creation-page__submit-button"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCreationPage;