import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProjects, getAllDevelopers, assignDeveloper } from '../api/auth.js';

const AssignDeveloperPageStyles = `
    .assign-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
    }
    .assign-header {
        margin-bottom: 2rem;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 1rem;
    }
    .form-card {
        background-color: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .form-group {
        margin-bottom: 1.5rem;
    }
    .form-group label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: #4b5563;
        margin-bottom: 0.5rem;
    }
    .form-group select {
        width: 100%;
        padding: 0.75rem;
        border-radius: 4px;
        border: 1px solid #cbd5e1;
    }
    .submit-button {
        width: 100%;
        background-color: #4c51bf;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        border: none;
    }
    .submit-button:hover:not(:disabled) {
        background-color: #434190;
    }
    .submit-button:disabled {
        background-color: #a0aec0;
        cursor: not-allowed;
    }
    .spinner-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
    }
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top-color: #4c51bf;
        border-radius: 50%;
        animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .error-message {
        padding: 1rem;
        background-color: #fef2f2;
        color: #991b1b;
        border: 1px solid #fca5a5;
        border-radius: 8px;
        text-align: center;
        font-weight: 500;
        margin-top: 1rem;
    }
`;


const AssignDeveloperPage = () => {
    const [projects, setProjects] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedDeveloperId, setSelectedDeveloperId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projectList = await getMyProjects();
                setProjects(projectList);

                const developerList = await getAllDevelopers();
                setDevelopers(developerList);

                if (projectList.length > 0) {
                    setSelectedProjectId(projectList[0].projectId.toString());
                }
                if (developerList.length > 0) {
                    setSelectedDeveloperId(developerList[0].userId.toString());
                }
            } catch (err) {
                setError(err.message || '데이터를 불러오는 데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedProjectId || !selectedDeveloperId) {
            alert('프로젝트와 개발자를 모두 선택해주세요.');
            return;
        }

        try {
            const response = await assignDeveloper(selectedProjectId, { userId: parseInt(selectedDeveloperId) });
            // ✅ API 응답이 순수 문자열이므로, .message 접근 없이 바로 사용
            alert(response); // '개발자 배정 완료' 메시지가 직접 alert으로 표시됩니다.
            navigate(`/project/${selectedProjectId}`);
        } catch (err) {
            // 백엔드에서 던진 RuntimeException 메시지를 그대로 사용
            setError(err.message);
        }
    };

    if (isLoading) return <div className="spinner-container"><style>{AssignDeveloperPageStyles}</style><div className="spinner"></div></div>;
    if (error) return <div className="assign-container"><style>{AssignDeveloperPageStyles}</style><div className="error-message">{error}</div></div>;

    return (
        <div className="assign-container">
            <style>{AssignDeveloperPageStyles}</style>
            <header className="assign-header">
                <h1 className="text-2xl font-bold">개발자 배정</h1>
            </header>
            <div className="form-card">
                <form onSubmit={handleAssign}>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">프로젝트 선택</label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            {projects.map(p => (
                                <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">배정할 개발자 선택</label>
                        <select
                            value={selectedDeveloperId}
                            onChange={(e) => setSelectedDeveloperId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            {developers.map(d => (
                                <option key={d.userId} value={d.userId}>{d.name} ({d.email})</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={!selectedProjectId || !selectedDeveloperId}
                    >
                        개발자 배정하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AssignDeveloperPage;
