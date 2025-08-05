import { createBrowserRouter } from 'react-router-dom';

import Home from './mainPage/Home';
import MainContent from './mainPage/MainContent';
import Header from './mainPage/Header';
import Footer from './mainPage/Footer';
import Plan from './plan/Plan';
import PrivacyPolicy from './mainPage/PrivacyPolicy'; // 개인정보처리방침 컴포넌트 추가
import TermsOfService from './mainPage/TermsOfService';
import Development from './development/Development'; // 개발 컴포넌트 추가

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
        path:'/privacy',
        element: <PrivacyPolicy />
    },
    {
        id: 6,
        path:'/terms',
        element: <TermsOfService/>
    },
    {
        id: 7,
        path: '/development',
        element: <Development/>,
    }



]);
export default router;