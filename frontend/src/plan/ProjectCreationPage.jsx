import React, { useState as useStateProject } from 'react';
import { createProject as apiCreateProject } from '../api/auth.js';


// 아이콘 컴포넌트
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ExclamationCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ProjectCreationPage = () => {
    const [projectName, setProjectName] = useStateProject('');
    const [description, setDescription] = useStateProject('');
    const [isLoading, setIsLoadingProject] = useStateProject(false);
    const [apiResponse, setApiResponse] = useStateProject(null);
    const [error, setErrorProject] = useStateProject(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!projectName.trim()) {
            setErrorProject({ message: '프로젝트 제목을 입력해주세요.' });
            return;
        }

        setIsLoadingProject(true);
        setApiResponse(null);
        setErrorProject(null);

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
            setErrorProject({ message: err.message });
        } finally {
            setIsLoadingProject(false);
        }
    };

    const handleReset = () => {
        setProjectName('');
        setDescription('');
        setApiResponse(null);
        setErrorProject(null);
    };

    return (
        <div className="bg-slate-100 min-h-screen flex items-center justify-center font-sans p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">새로운 보드게임 프로젝트</h1>
                        <p className="text-slate-500 mb-8">세상을 놀라게 할 당신의 아이디어를 현실로 만들어보세요.</p>

                        {apiResponse && (
                            <div className="bg-green-50 border-l-4 border-green-400 text-green-700 p-6 rounded-lg mb-6 text-center shadow-sm">
                                <CheckCircleIcon />
                                <h3 className="text-xl font-bold mb-2">프로젝트 생성 완료!</h3>
                                <p className="mb-4">{apiResponse.message}</p>
                                <div className="text-left bg-white p-4 rounded-md border">
                                    <p><strong>프로젝트 ID:</strong> {apiResponse.projectId}</p>
                                    <p><strong>프로젝트 이름:</strong> {apiResponse.projectName}</p>
                                    <p><strong>기획자:</strong> {apiResponse.creatorName}</p>
                                </div>
                                <button onClick={handleReset} className="mt-6 w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                                    새 프로젝트 생성하기
                                </button>
                            </div>
                        )}

                        {error && (
                             <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-6 rounded-lg mb-6 text-center shadow-sm">
                                <ExclamationCircleIcon />
                                <h3 className="text-xl font-bold mb-2">오류 발생</h3>
                                <p>{error.message}</p>
                                 <button onClick={handleReset} className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                                    다시 시도하기
                                 </button>
                            </div>
                        )}

                        {!apiResponse && !error && (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label htmlFor="projectName" className="block text-slate-700 text-sm font-bold mb-2">
                                        프로젝트 제목
                                    </label>
                                    <input
                                        type="text"
                                        id="projectName"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="예: 차원의 균열"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="mb-8">
                                    <label htmlFor="description" className="block text-slate-700 text-sm font-bold mb-2">
                                        프로젝트 설명 (선택 사항)
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="4"
                                        placeholder="이 프로젝트에 대한 간단한 설명을 입력하세요."
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                                        disabled={isLoading}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center transition duration-300 disabled:bg-slate-400"
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCreationPage;
