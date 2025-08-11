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
import Development from './development/Development';
import PlanReview from './plan/PlanReview';

const router = createBrowserRouter([
    {
        id: 0,
        path:'/',
        element:<Home/>
    },
    {
        id: 1,
        path: '/MainContent',
        element: <MainContent />,
    },
    {
        id: 2,
        path:'/Header',
        element: <Header/>
    },
    {
        id: 3,
        path:'/footer',
        elment: <Footer/>
    },
    {
        id: 4,
        path:'/plan',
        element: <Plan/>
    },
    {
        id: 5,
        path: '/project/create',
        element: <ProjectCreationPage/>
    },
    {
        id: 6,
        path: '/login',
        element: <Login/>
    },
    {
        id: 7,
        path: '/signup',
        element: <SignUp/>
    },
    {
        id: 8,
        path: '/project/:projectId/rename',
        element: <ProjectRenamePage/>
    },
    {
        id: 9,
        path:'/myPage',
        element: <MyPage/>
    },
    {
        id:10,
        path:'/development',
        element: <Development/>
    },
    {
        id:11,
        path: 'plan-review',
        element: <PlanReview/>
    }



]);
export default router;
