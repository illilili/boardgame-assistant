import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectDetails, generateConceptForProject, regenerateConceptForProject } from '../api/auth.js';

const ProjectDetailPage = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // UI 상태
    const [activeTab, setActiveTab] = useState('generate');
    const [displayedConcept, setDisplayedConcept] = useState(null);
    
    // 새 컨셉 생성 폼 상태
    const [theme, setTheme] = useState('');
    const [playerCount, setPlayerCount] = useState('');
    const [averageWeight, setAverageWeight] = useState(2.5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState('');

    // 컨셉 재생성 폼 상태
    const [selectedConceptId, setSelectedConceptId] = useState('');
    const [feedback, setFeedback] = useState('');
    
    const fetchProjectDetails = async () => {
        try {
            // setLoading(true)는 페이지 첫 로드 시에만 사용
            const data = await getProjectDetails(projectId);
            setProject(data);
        } catch (err) {
            setError(err.message || '프로젝트 정보를 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId]);

    const handleGenerateConcept = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setGenerationError('');
        try {
            const newConcept = await generateConceptForProject(projectId, { theme, playerCount, averageWeight });
            alert('새로운 컨셉이 성공적으로 생성되었습니다!');
            setTheme('');
            setPlayerCount('');
            setAverageWeight(2.5);
            setDisplayedConcept(newConcept); // 생성된 컨셉을 바로 보여줌
            fetchProjectDetails(); // 백그라운드에서 목록 새로고침
        } catch (err) {
            setGenerationError(err.message || '컨셉 생성에 실패했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegenerateConcept = async (e) => {
        e.preventDefault();
        if (!selectedConceptId || !feedback) {
            setGenerationError('재생성할 컨셉과 피드백을 모두 입력해주세요.');
            return;
        }
        
        const originalConceptData = project.concepts.find(c => c.conceptId === parseInt(selectedConceptId));
        if (!originalConceptData) {
            setGenerationError('선택된 컨셉 정보를 찾을 수 없습니다.');
            return;
        }

        setIsGenerating(true);
        setGenerationError('');
        try {
            const regeneratedConcept = await regenerateConceptForProject(projectId, {
                originalConcept: originalConceptData,
                feedback: feedback
            });
            alert('컨셉이 성공적으로 재생성되었습니다!');
            setFeedback('');
            setSelectedConceptId('');
            setDisplayedConcept(regeneratedConcept); // 재생성된 컨셉을 바로 보여줌
            fetchProjectDetails(); // 백그라운드에서 목록 새로고침
        } catch (err) {
            setGenerationError(err.message || '컨셉 재생성에 실패했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleConceptSelectionChange = (e) => {
        const conceptId = e.target.value;
        setSelectedConceptId(conceptId);
        if (conceptId) {
            const conceptToPreview = project.concepts.find(c => c.conceptId === parseInt(conceptId));
            setDisplayedConcept(conceptToPreview);
        } else {
            setDisplayedConcept(null);
        }
    };

    if (loading) return <div className="text-center mt-20">프로젝트 정보를 불러오는 중...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
    if (!project) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">{project.projectName}</h1>
                    <p className="text-gray-500">프로젝트 ID: {project.projectId}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* 왼쪽: 컨트롤 패널 (생성/재생성 탭) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow-lg rounded-lg sticky top-24">
                            <div className="flex border-b">
                                <button onClick={() => setActiveTab('generate')} className={`flex-1 p-4 text-center font-semibold ${activeTab === 'generate' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>
                                    새로 만들기
                                </button>
                                <button onClick={() => setActiveTab('regenerate')} className={`flex-1 p-4 text-center font-semibold ${activeTab === 'regenerate' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>
                                    다시 만들기
                                </button>
                            </div>

                            <div className="p-6">
                                {activeTab === 'generate' && (
                                    <form onSubmit={handleGenerateConcept} className="space-y-4">
                                        <h3 className="text-lg font-bold">새로운 게임 컨셉 만들기</h3>
                                        {generationError && <p className="text-red-500 text-sm">{generationError}</p>}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">게임 테마</label>
                                            <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">플레이어 수</label>
                                            <input type="text" value={playerCount} onChange={(e) => setPlayerCount(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">난이도: {averageWeight}</label>
                                            <input type="range" value={averageWeight} onChange={(e) => setAverageWeight(parseFloat(e.target.value))} min="1.0" max="5.0" step="0.1" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                        </div>
                                        <button type="submit" disabled={isGenerating} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400">
                                            {isGenerating ? '생성 중...' : 'AI로 컨셉 생성'}
                                        </button>
                                    </form>
                                )}
                                {activeTab === 'regenerate' && (
                                    <form onSubmit={handleRegenerateConcept} className="space-y-4">
                                        <h3 className="text-lg font-bold">기존 컨셉 발전시키기</h3>
                                        {generationError && <p className="text-red-500 text-sm">{generationError}</p>}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">재생성할 컨셉 선택</label>
                                            <select value={selectedConceptId} onChange={handleConceptSelectionChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                                <option value="">-- 컨셉 선택 --</option>
                                                {project.concepts.map(c => <option key={c.conceptId} value={c.conceptId}>ID: {c.conceptId} - {c.theme}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">피드백</label>
                                            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} required rows="4" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                                        </div>
                                        <button type="submit" disabled={isGenerating || !selectedConceptId} className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-400">
                                            {isGenerating ? '재생성 중...' : 'AI로 컨셉 재생성'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 결과 표시 영역 */}
                    <div className="lg:col-span-3">
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">컨셉 보드</h2>
                            {displayedConcept ? (
                                <div className="animate-fade-in">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-2xl font-bold text-indigo-700">{displayedConcept.theme}</h3>
                                        <div>
                                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-gray-200">
                                                Concept ID: {displayedConcept.conceptId}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-4">
                                        <span><strong>플레이 인원:</strong> {displayedConcept.playerCount}</span> | 
                                        <span> <strong>난이도:</strong> {displayedConcept.averageWeight.toFixed(1)}</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div><h4 className="font-bold">핵심 아이디어</h4><p className="text-gray-600">{displayedConcept.ideaText}</p></div>
                                        <div><h4 className="font-bold">주요 메커니즘</h4><p className="text-gray-600">{displayedConcept.mechanics}</p></div>
                                        <div><h4 className="font-bold">배경 스토리</h4><p className="text-gray-600">{displayedConcept.storyline}</p></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">왼쪽에서 새 컨셉을 만들거나 기존 컨셉을 선택하여 확인하세요.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailPage;