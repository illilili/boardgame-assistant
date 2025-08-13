import React, { useState as useStateMyPage, useEffect as useEffectMyPage } from 'react';
import { Link as LinkMyPage } from 'react-router-dom';
import { getMyPageInfo as apiGetMyPageInfo } from '../api/auth.js';

const MyPage = () => {
    const [userData, setUserData] = useStateMyPage(null);
    const [loading, setLoading] = useStateMyPage(true);
    const [error, setErrorMyPage] = useStateMyPage('');

    useEffectMyPage(() => {
        const fetchMyPageData = async () => {
            try {
                const data = await apiGetMyPageInfo();
                setUserData(data);
            } catch (err) {
                setErrorMyPage(err.message || '마이페이지 정보를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyPageData();
    }, []);

    if (loading) return <div className="text-center mt-20">로딩 중...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">마이페이지</h1>
                {userData && (
                    <>
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">기본 정보</h2>
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p><strong>이름:</strong> {userData.userName}</p>
                                <p><strong>이메일:</strong> {userData.email}</p>
                                <p><strong>회사:</strong> {userData.company || '미입력'}</p>
                                <p><strong>역할:</strong> {userData.role}</p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">참여중인 프로젝트 ({userData.participatingProjects.length}개)</h2>
                            <div className="space-y-4">
                                {userData.participatingProjects.length > 0 ? (
                                    userData.participatingProjects.map(project => (
                                        <div key={project.projectId} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-bold text-indigo-600">{project.projectName}</h3>
                                                <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                                                    project.status === 'DRAFT' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'
                                                }`}>{project.status}</span>
                                            </div>
                                            <LinkMyPage to={`/project/${project.projectId}/rename`} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300">
                                                이름 수정
                                            </LinkMyPage>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">아직 참여중인 프로젝트가 없습니다.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default MyPage;
