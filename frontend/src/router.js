import { createBrowserRouter } from 'react-router-dom';

import Home from './mainPage/Home';
import MainContent from './mainPage/MainContent';
import Header from './mainPage/Header';
import Footer from './mainPage/Footer';
import Plan from './plan/Plan';
import ProjectCreationPage from './plan/ProjectCreationPage';
import Login from './auth/Login';
import SignUp from './auth/SignUp';
import MyPage from './auth/Mypage';
import ProjectRenamePage from './plan/ProjectRenamePage';
import ReviewsHome from './publish/reviews/ReviewsHome';

import Publish from './publish/Publish';
import ProjectListPage from './project/ProjectListPage';
import ProjectHomePage from './project/ProjectHomePage';
import AdminUserManagePage from './admin/UserManagePage'
import DevelopmentWrapper from './development/DevelopmentWrapper';
import ReviewDetailPage from './publish/ReviewDetailPage';
import AssignDeveloperPage from './publish/AssignDeveloperPage';
import TrendAnalysisHome from './trendAnalysis/TrendAnalysisHome';
import LiveTop50Analysis from './trendAnalysis/LiveTop50Analysis';
import OriginalGameAnalysis from './trendAnalysis/OriginalGameAnalysis';
import InteractiveDashboard from './trendAnalysis/components/interactive/InteractiveDashboard';


const router = createBrowserRouter([
  {
    id: 0,
    path: '/',
    element: <Home />
  },
  {
    id: 1,
    path: '/MainContent',
    element: <MainContent />,
  },
  {
    id: 2,
    path: '/Header',
    element: <Header />
  },
  {
    id: 3,
    path: '/footer',
    element: <Footer />
  },
  {
    id: 4,
    path: '/projects/:projectId/plan',
    element: <Plan />
  },
  {
    id: 5,
    path: '/project/create',
    element: <ProjectCreationPage />
  },
  {
    id: 6,
    path: '/login',
    element: <Login />
  },
  {
    id: 7,
    path: '/signup',
    element: <SignUp />
  },
  {
    id: 8,
    path: '/project/:projectId/rename',
    element: <ProjectRenamePage />
  },
  {
    id: 9,
    path: '/myPage',
    element: <MyPage />
  },
  {
    id: 10,
    path: '/projects/:projectId/development',
    element: <DevelopmentWrapper />
  },
  {
    id: 11,
    path: '/plan-review',
    element: <ReviewsHome />
  },
  {
    id: 12,
    path: '/projects/:projectId/publish',
    element: <Publish />
  },
  {
    id: 13,
    path: '/projects',
    element: <ProjectListPage />
  },
  {
    id: 14,
    path: '/projects/:projectId',
    element: <ProjectHomePage />
  },
  {
    id: 15,
    path: '/user-manage',
    element: <AdminUserManagePage />
  },
  {
    id: 16,
    path: '/review/:planId',
    element: <ReviewDetailPage />
  },
  {
    id: 17,// 3. 개발자 배정 페이지 (승인 후 이동)
    path: '/assign-developer/:projectId',
    element: <AssignDeveloperPage />
  },
  {
    id: 18,
    path: '/trend',
    element: <TrendAnalysisHome />
  },
  {
    id: 19,
    path: '/trend/live-top50',
    element: <LiveTop50Analysis />
  },
  {
    id: 20,
    path: '/trend/original',
    element: <OriginalGameAnalysis />
  },
  {
    id: 21,
    path: '/trend/interactive',
    element: <InteractiveDashboard />
  },




]);
export default router;
