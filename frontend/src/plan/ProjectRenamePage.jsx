import React, { useState as useStateRename } from 'react';
import { useParams, useNavigate as useNavigateRename, Link as LinkRename } from 'react-router-dom';
import { renameProject as apiRenameProject } from '../api/auth.js';

const ProjectRenamePage = () => {
    const { projectId } = useParams(); // URL에서 projectId를 가져옵니다.
    const navigate = useNavigateRename();
    const [newTitle, setNewTitle] = useStateRename('');
    const [isLoading, setIsLoadingRename] = useStateRename(false);
    const [apiResponse, setApiResponse] = useStateRename(null);
    const [error, setErrorRename] = useStateRename(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!newTitle.trim()) {
            setErrorRename({ message: '새로운 프로젝트 제목을 입력해주세요.' });
            return;
        }
        setIsLoadingRename(true);
        setApiResponse(null);
        setErrorRename(null);
        try {
            // useParams로 가져온 projectId를 API 함수에 전달합니다.
            const data = await apiRenameProject(projectId, newTitle);
            setApiResponse(data);
        } catch (err) {
            setErrorRename({ message: err.message });
        } finally {
            setIsLoadingRename(false);
        }
    };

    return (
        <div className="bg-slate-100 min-h-screen flex items-center justify-center font-sans p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">프로젝트 이름 수정</h1>
                <p className="text-slate-500 mb-8">프로젝트 ID: {projectId}</p>

                {apiResponse && (
                    <div className="bg-green-50 border-l-4 border-green-400 text-green-700 p-6 rounded-lg mb-6 text-center shadow-sm">
                        <h3 className="text-xl font-bold mb-2">수정 완료!</h3>
                        <p className="mb-4">{apiResponse.message}</p>
                        <p><strong>새 제목:</strong> {apiResponse.updatedTitle}</p>
                        <button onClick={() => navigate('/mypage')} className="mt-6 w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition">
                            마이페이지로 돌아가기
                        </button>
                    </div>
                )}
                {error && (
                     <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-6 rounded-lg mb-6 text-center shadow-sm">
                        <h3 className="text-xl font-bold mb-2">오류 발생</h3>
                        <p>{error.message}</p>
                         <LinkRename to="/mypage" className="mt-6 block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition">
                            마이페이지로 돌아가기
                         </LinkRename>
                    </div>
                )}

                {!apiResponse && !error && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="newTitle" className="block text-slate-700 text-sm font-bold mb-2">새 프로젝트 제목</label>
                            <input type="text" id="newTitle" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="새로운 제목을 입력하세요" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" disabled={isLoading} />
                        </div>
                        <div className="flex items-center justify-between">
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:bg-slate-400" disabled={isLoading}>
                                {isLoading ? '수정 중...' : '수정하기'}
                            </button>
                            <LinkRename to="/mypage" className="text-gray-600 hover:text-gray-800 font-medium">취소</LinkRename>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProjectRenamePage;